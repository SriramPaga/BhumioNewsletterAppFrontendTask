import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClickStat } from './entities/click_stat.entity';
import { CreateClickStatDto } from './dto/create-click_stat.dto';
import { Campaign } from '../campaigns/entities/campaign.entity';
import { Link } from './entities/link.entity';
import { Subscriber } from '../subscribers/entities/subscriber.entity';
import { List } from '../lists/entities/list.entity';
import { TrackingTokenService } from '../security/tracking-token.service';
import { QueueProducerService } from '../queues/queue-producer.service';
import {
  sanitizeAndValidateUrl,
  sanitizeIp,
  sanitizeUserAgent,
} from '../common/sanitize.util';
import { ClickEvent } from './entities/click_event.entity';

@Injectable()
export class ClickStatService {
  constructor(
    @InjectRepository(ClickStat)
    private readonly clickStatRepository: Repository<ClickStat>,
    @InjectRepository(Link)
    private readonly linkRepository: Repository<Link>,
    @InjectRepository(Campaign)
    private readonly campaignRepository: Repository<Campaign>,
    @InjectRepository(List)
    private readonly listRepository: Repository<List>,
    @InjectRepository(Subscriber)
    private readonly subscriberRepository: Repository<Subscriber>,
    @InjectRepository(ClickEvent)
    private readonly clickEventRepository: Repository<ClickEvent>,
    private readonly trackingTokenService: TrackingTokenService,
    private readonly producer: QueueProducerService,
  ) {}

  async create(
    createClickStatDto: CreateClickStatDto,
  ) {
    const clickStat = new ClickStat();
    clickStat.link = createClickStatDto.link;
    clickStat.clickCount =
      createClickStatDto.clickCount || 0;

    const campaign =
      await this.campaignRepository.findOne({
        where: {
          id: createClickStatDto.campaignId,
        },
      });
    if (!campaign) {
      throw new NotFoundException(
        'Campaign not found',
      );
    }

    clickStat.campaign = campaign;
    return this.clickStatRepository.save(
      clickStat,
    );
  }

  findAll() {
    return this.clickStatRepository.find({
      relations: ['campaign'],
    });
  }

  async getOrCreateLink(
    url: string,
  ): Promise<Link> {
    const normalizedUrl =
      sanitizeAndValidateUrl(url);
    const existing =
      await this.linkRepository.findOne({
        where: { url: normalizedUrl },
      });
    if (existing) return existing;

    const link = this.linkRepository.create({
      cid: this.makeCid(),
      url: normalizedUrl,
      hits: 0,
      visits: 0,
    });
    return this.linkRepository.save(link);
  }

  createClickTrackingToken(input: {
    campaignId: string;
    listId: string;
    subscriberId: string;
    organizationId: string;
    linkId: number;
    originalUrl: string;
  }) {
    return this.trackingTokenService.createToken({
      campaignId: input.campaignId,
      listId: input.listId,
      subscriberId: input.subscriberId,
      organizationId: input.organizationId,
      linkId: input.linkId,
      url: sanitizeAndValidateUrl(
        input.originalUrl,
      ),
      eventType: 'click',
    });
  }

  createOpenTrackingToken(input: {
    campaignId: string;
    listId: string;
    subscriberId: string;
    organizationId: string;
  }) {
    return this.trackingTokenService.createToken({
      campaignId: input.campaignId,
      listId: input.listId,
      subscriberId: input.subscriberId,
      organizationId: input.organizationId,
      linkId: -1,
      eventType: 'open',
    });
  }

  async enqueueFromToken(
    token: string,
    ip: string,
    userAgent: string,
  ) {
    const isValidBrowser =
      /Mozilla|AppleWebKit|Chrome|Safari|Edge|Opera|Mobile/i.test(
        userAgent || '',
      );
    const isBotOrProxy =
      /bot|spider|crawl|slurp|barracuda|mimecast|preview|phantom/i.test(
        userAgent || '',
      );

    if (!isValidBrowser || isBotOrProxy) {
      console.log(
        `[Tracking] Ignored non-human click. UA: ${userAgent}`,
      );
      throw new UnauthorizedException(
        'Bot traffic detected',
      );
    }

    const payload =
      this.trackingTokenService.verifyToken(
        token,
      );
    this.assertUuidPayload(payload);

    if (
      payload.eventType !== 'click' ||
      !payload.url
    ) {
      throw new UnauthorizedException(
        'Invalid click tracking token',
      );
    }

    await this.assertEntities(
      payload.campaignId,
      payload.listId,
      payload.subscriberId,
    );

    const registeredLink =
      await this.linkRepository.findOne({
        where: { id: payload.linkId },
      });
    if (
      !registeredLink ||
      registeredLink.url !== payload.url
    ) {
      throw new UnauthorizedException(
        'Redirect URL mismatch or not registered',
      );
    }

    const existingClick =
      await this.clickEventRepository.findOne({
        where: {
          campaignId: payload.campaignId,
          subscriberId: payload.subscriberId,
          linkId: payload.linkId,
          eventType: 'click',
        },
      });

    if (!existingClick) {
      await this.linkRepository.increment(
        { id: payload.linkId },
        'hits',
        1,
      );

      console.log(
        `[Tracking] Enqueuing CLICK event for Sub=${payload.subscriberId}, Link=${payload.linkId}`,
      );

      await this.producer.enqueueClickEvent({
        organizationId: payload.organizationId,
        campaignId: payload.campaignId,
        listId: payload.listId,
        subscriberId: payload.subscriberId,
        linkId: payload.linkId,
        originalUrl: payload.url,
        ipAddress: sanitizeIp(ip),
        userAgent: sanitizeUserAgent(userAgent),
        eventType: 'click',
        occurredAt: new Date().toISOString(),
      });
    }

    return payload.url;
  }

  private readonly OPEN_GRACE_PERIOD_SECONDS = 10;

  async enqueueOpenFromToken(
    token: string,
    ip: string,
    userAgent: string,
  ) {
    const payload =
      this.trackingTokenService.verifyToken(
        token,
      );
    this.assertUuidPayload(payload);

    if (payload.eventType !== 'open') {
      throw new UnauthorizedException(
        'Invalid open tracking token',
      );
    }

    const nowSeconds = Math.floor(
      Date.now() / 1000,
    );
    const secondsSinceSent =
      nowSeconds - payload.iat;

    if (
      secondsSinceSent <
      this.OPEN_GRACE_PERIOD_SECONDS
    ) {
      console.log(
        `[Tracking] Ignored machine open (${secondsSinceSent}s after send). ` +
          `Campaign=${payload.campaignId}, Sub=${payload.subscriberId}`,
      );
      return;
    }

    const existingOpen =
      await this.clickEventRepository.findOne({
        where: {
          campaignId: payload.campaignId,
          subscriberId: payload.subscriberId,
          eventType: 'open',
        },
      });

    if (existingOpen) {
      return;
    }

    console.log(
      `[Tracking] Genuine open registered (${secondsSinceSent}s after send). ` +
        `Campaign=${payload.campaignId}, Sub=${payload.subscriberId}`,
    );

    await this.producer.enqueueClickEvent({
      organizationId: payload.organizationId,
      campaignId: payload.campaignId,
      listId: payload.listId,
      subscriberId: payload.subscriberId,
      linkId: -1,
      ipAddress: sanitizeIp(ip),
      userAgent: sanitizeUserAgent(userAgent),
      eventType: 'open',
      occurredAt: new Date().toISOString(),
    });
  }

  async getCampaignStats(
    campaignId: string,
    organizationId?: string,
  ): Promise<{
    campaignId: string;
    clicks: string;
    opens: string;
    uniqueSubscribers: string;
  }> {
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

    if (!uuidRegex.test(campaignId)) {
      return {
        campaignId,
        clicks: '0',
        opens: '0',
        uniqueSubscribers: '0',
      };
    }

    const qb = this.clickEventRepository
      .createQueryBuilder('event')
      .select('event.campaignId', 'campaignId')
      .addSelect(
        `COALESCE(SUM(CASE WHEN event.eventType = 'click' THEN 1 ELSE 0 END), 0)`,
        'clicks',
      )
      .addSelect(
        `COALESCE(SUM(CASE WHEN event.eventType = 'open' THEN 1 ELSE 0 END), 0)`,
        'opens',
      )
      .addSelect(
        'COALESCE(COUNT(DISTINCT event.subscriberId), 0)',
        'uniqueSubscribers',
      )
      .where('event.campaignId = :campaignId', {
        campaignId,
      });

    if (organizationId) {
      qb.andWhere(
        'event.organizationId = :organizationId',
        { organizationId },
      );
    }

    const row = await qb
      .groupBy('event.campaignId')
      .getRawOne();

    if (!row) {
      return {
        campaignId,
        clicks: '0',
        opens: '0',
        uniqueSubscribers: '0',
      };
    }

    return row as {
      campaignId: string;
      clicks: string;
      opens: string;
      uniqueSubscribers: string;
    };
  }

  private assertUuidPayload(payload: {
    campaignId: string;
    listId: string;
    subscriberId: string;
    organizationId: string;
  }) {
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (
      !uuidRegex.test(payload.campaignId) ||
      !uuidRegex.test(payload.listId) ||
      !uuidRegex.test(payload.subscriberId) ||
      !uuidRegex.test(payload.organizationId)
    ) {
      throw new BadRequestException(
        'Tracking token payload is malformed',
      );
    }
  }

  private async assertEntities(
    campaignId: string,
    listId: string,
    subscriberId: string,
  ) {
    const [campaign, list, subscriber] =
      await Promise.all([
        this.campaignRepository.findOne({
          where: { id: campaignId },
        }),
        this.listRepository.findOne({
          where: { id: listId },
        }),
        this.subscriberRepository.findOne({
          where: { id: subscriberId },
        }),
      ]);

    if (!campaign || !list || !subscriber) {
      throw new NotFoundException(
        'Campaign, list, or subscriber not found',
      );
    }
  }

  private makeCid() {
    return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 10)}`;
  }
}
