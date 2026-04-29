import {
  OnWorkerEvent,
  Processor,
  WorkerHost,
} from '@nestjs/bullmq';
import { InjectRepository } from '@nestjs/typeorm';
import { InjectQueue } from '@nestjs/bullmq';
import { Job, Queue } from 'bullmq';
import { Repository } from 'typeorm';
import { QueueNames } from '../queue.constants';
import { ClickEvent } from '../../click_stats/entities/click_event.entity';
import { ClickStat } from '../../click_stats/entities/click_stat.entity';
import { Campaign } from '../../campaigns/entities/campaign.entity';
import { StatsGateway } from '../../realtime/stats.gateway';

interface ClickJobData {
  organizationId: string;
  campaignId: string;
  listId: string;
  subscriberId: string;
  linkId: number;
  originalUrl?: string;
  ipAddress: string;
  userAgent: string;
  eventType: 'click' | 'open';
  occurredAt: string;
}

@Processor(QueueNames.CLICK)
export class ClickEventsProcessor extends WorkerHost {
  constructor(
    @InjectRepository(ClickEvent)
    private readonly clickEventRepository: Repository<ClickEvent>,
    @InjectRepository(ClickStat)
    private readonly clickStatRepository: Repository<ClickStat>,
    @InjectRepository(Campaign)
    private readonly campaignRepository: Repository<Campaign>,
    @InjectQueue(QueueNames.DLQ)
    private readonly dlqQueue: Queue,
    private readonly statsGateway: StatsGateway,
  ) {
    super();
  }

  async process(
    job: Job<ClickJobData>,
  ): Promise<void> {
    const data = job.data;
    const event =
      this.clickEventRepository.create({
        organizationId: data.organizationId,
        campaignId: data.campaignId,
        listId: data.listId,
        subscriberId: data.subscriberId,
        linkId: data.linkId,
        originalUrl: data.originalUrl || null,
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
        eventType: data.eventType,
        occurredAt: new Date(data.occurredAt),
      });
    await this.clickEventRepository.save(event);

    if (
      data.eventType === 'click' &&
      data.originalUrl
    ) {
      let aggregate =
        await this.clickStatRepository.findOne({
          where: {
            campaign: { id: data.campaignId },
            link: data.originalUrl,
          },
          relations: ['campaign'],
        });

      if (!aggregate) {
        const campaign =
          await this.campaignRepository.findOne({
            where: { id: data.campaignId },
          });
        if (campaign) {
          aggregate =
            this.clickStatRepository.create({
              campaign,
              link: data.originalUrl,
              clickCount: 0,
            });
        }
      }

      if (aggregate) {
        aggregate.clickCount += 1;
        await this.clickStatRepository.save(
          aggregate,
        );
      }
    }

    this.statsGateway.emitTenantEvent(
      data.organizationId,
      'click.processed',
      {
        campaignId: data.campaignId,
        subscriberId: data.subscriberId,
        linkId: data.linkId,
        eventType: data.eventType,
        occurredAt: data.occurredAt,
      },
    );

    console.log(
      `[WebSocket] Broadcasted 'click.processed' containing '${data.eventType}' to tenant:${data.organizationId}`,
    );
  }

  @OnWorkerEvent('failed')
  async onFailed(
    job: Job<ClickJobData> | undefined,
    err: Error,
  ) {
    if (!job) return;
    await this.dlqQueue.add('click-dlq', {
      queue: QueueNames.CLICK,
      name: job.name,
      data: job.data,
      reason: err.message,
      failedAt: new Date().toISOString(),
    });
  }
}
