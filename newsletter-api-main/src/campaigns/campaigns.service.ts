import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Campaign } from './entities/campaign.entity';
import { CreateCampaignDto } from './dto/create-campaign.dto';
import { List } from '../lists/entities/list.entity';
import { Organization } from '../organizations/entities/organization.entity';
import { ListService } from '../lists/lists.service';
import { QueueProducerService } from '../queues/queue-producer.service';
import { Link } from '../click_stats/entities/link.entity';
import { TrackingTokenService } from '../security/tracking-token.service';
import { sanitizeAndValidateUrl } from '../common/sanitize.util';

@Injectable()
export class CampaignService {
  constructor(
    @InjectRepository(Campaign)
    private readonly campaignRepository: Repository<Campaign>,
    @InjectRepository(List)
    private readonly listRepository: Repository<List>,
    @InjectRepository(Organization)
    private readonly organizationRepository: Repository<Organization>,
    @InjectRepository(Link)
    private readonly linkRepository: Repository<Link>,
    private readonly listService: ListService,
    private readonly queueProducer: QueueProducerService,
    private readonly trackingTokenService: TrackingTokenService,
  ) {}

  async createCampaign(
    createCampaignDto: CreateCampaignDto,
  ): Promise<Campaign> {
    if (
      !createCampaignDto.listId ||
      !createCampaignDto.organizationId
    ) {
      throw new BadRequestException(
        'Campaign must be linked to a list and organization',
      );
    }

    const campaign = new Campaign();
    campaign.subject = createCampaignDto.subject;
    campaign.content = createCampaignDto.content;
    campaign.targetUrl =
      createCampaignDto.targetUrl || null;

    const [list, organization] =
      await Promise.all([
        this.listRepository.findOne({
          where: { id: createCampaignDto.listId },
        }),
        this.organizationRepository.findOne({
          where: {
            id: createCampaignDto.organizationId,
          },
        }),
      ]);

    if (!list)
      throw new NotFoundException(
        'List not found',
      );
    if (!organization)
      throw new NotFoundException(
        'Organization not found',
      );

    campaign.list = list;
    campaign.organization = organization;

    return this.campaignRepository.save(campaign);
  }

  async listCampaigns(): Promise<Campaign[]> {
    return this.campaignRepository.find({
      relations: ['list', 'organization'],
      order: { createdAt: 'DESC' },
    });
  }

  async sendCampaign(
    id: string,
    filters?: Record<string, any>,
  ) {
    const campaign =
      await this.campaignRepository.findOne({
        where: { id },
        relations: ['list', 'organization'],
      });
    if (!campaign)
      throw new NotFoundException(
        'Campaign not found',
      );
    if (
      !campaign.list?.id ||
      !campaign.organization?.id
    ) {
      throw new BadRequestException(
        'Campaign must be linked to a list and organization',
      );
    }

    const BATCH_SIZE = 500;
    let offset = 0;
    let totalQueued = 0;
    const appBase =
      process.env.APP_BASE_URL ||
      'http://localhost:8000/api';

    const extractedLinks =
      await this.extractAndRegisterLinks(
        campaign.content,
      );

    while (true) {
      const segmented =
        await this.listService.segmentSubscribers(
          campaign.list.id,
          filters || {},
          { limit: BATCH_SIZE, offset },
        );

      const subscribers = segmented.data;
      if (!subscribers.length) break;

      const jobs = subscribers.map((sub) => {
        const openToken =
          this.trackingTokenService.createToken({
            campaignId: campaign.id,
            listId: campaign.list.id,
            subscriberId: sub.id,
            organizationId:
              campaign.organization.id,
            linkId: -1,
            eventType: 'open',
          });

        let trackedContent = campaign.content;
        for (const linkObj of extractedLinks) {
          const clickToken =
            this.trackingTokenService.createToken(
              {
                campaignId: campaign.id,
                listId: campaign.list.id,
                subscriberId: sub.id,
                organizationId:
                  campaign.organization.id,
                linkId: linkObj.id,
                url: linkObj.url,
                eventType: 'click',
              },
            );

          const trackingUrl = `${appBase}/click-stats/t/${clickToken}`;
          trackedContent = trackedContent
            .split(linkObj.url)
            .join(trackingUrl);
        }

        const finalHtml = `${trackedContent}
<img src="${appBase}/click-stats/o/${openToken}" width="1" height="1" alt="" style="border:0;height:1px;width:1px;opacity:0;" />`;

        return {
          name: 'send-email',
          data: {
            to: sub.email,
            subject: campaign.subject,
            text: finalHtml,
            organizationId:
              campaign.organization.id,
          },
          opts: {
            attempts: 5,
            backoff: {
              type: 'exponential',
              delay: 1000,
            },
            removeOnComplete: 2000,
            removeOnFail: 2000,
          },
        };
      });

      await this.queueProducer.enqueueEmailBatch(
        jobs,
      );
      totalQueued += subscribers.length;
      offset += BATCH_SIZE;

      if (subscribers.length < BATCH_SIZE) break;
    }

    return {
      campaignId: campaign.id,
      message: `Campaign "${campaign.subject}" queued with ${totalQueued} emails.`,
      totalSubscribers: totalQueued,
      filters: filters || {},
      queued: totalQueued,
    };
  }

  private async extractAndRegisterLinks(
    content: string,
  ): Promise<Link[]> {
    const urlRegex =
      /href=["'](https?:\/\/[^"']+)["']/gi;
    const urls = new Set<string>();
    let match;

    while (
      (match = urlRegex.exec(content)) !== null
    ) {
      urls.add(match[1]);
    }

    const registeredLinks: Link[] = [];
    for (const url of Array.from(urls)) {
      registeredLinks.push(
        await this.getOrCreateLink(url),
      );
    }
    return registeredLinks;
  }

  private getCampaignTargetUrl(
    campaign: Campaign,
  ): string {
    if (campaign.targetUrl)
      return sanitizeAndValidateUrl(
        campaign.targetUrl,
      );

    const firstUrl = campaign.content.match(
      /https?:\/\/[^\s"'<>]+/i,
    )?.[0];
    if (!firstUrl) {
      throw new BadRequestException(
        'No target URL found in campaign. Set targetUrl or include one URL in content.',
      );
    }
    return sanitizeAndValidateUrl(firstUrl);
  }

  private async getOrCreateLink(
    url: string,
  ): Promise<Link> {
    const existing =
      await this.linkRepository.findOne({
        where: { url },
      });
    if (existing) return existing;

    const link = this.linkRepository.create({
      cid: `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 10)}`,
      url,
      hits: 0,
      visits: 0,
    });
    return this.linkRepository.save(link);
  }
}
