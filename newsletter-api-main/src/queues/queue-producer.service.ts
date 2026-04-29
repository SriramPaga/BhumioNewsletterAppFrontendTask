import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { QueueNames } from './queue.constants';

@Injectable()
export class QueueProducerService {
  constructor(
    @InjectQueue(QueueNames.CLICK)
    private readonly clickQueue: Queue,
    @InjectQueue(QueueNames.EMAIL)
    private readonly emailQueue: Queue,
    @InjectQueue(QueueNames.AUTOMATION)
    private readonly automationQueue: Queue,
  ) {}

  async enqueueClickEvent(
    data: Record<string, unknown>,
  ) {
    return this.clickQueue.add(
      'track-click',
      data,
      {
        attempts: 5,
        backoff: {
          type: 'exponential',
          delay: 500,
        },
        removeOnComplete: 5000,
        removeOnFail: 5000,
      },
    );
  }

  async enqueueEmailEvent(
    data: Record<string, unknown>,
  ) {
    return this.emailQueue.add(
      'send-email',
      data,
      {
        attempts: 5,
        backoff: {
          type: 'exponential',
          delay: 1000,
        },
        removeOnComplete: 2000,
        removeOnFail: 2000,
      },
    );
  }

  async enqueueEmailBatch(
    jobs: {
      name: string;
      data: any;
      opts?: any;
    }[],
  ) {
    return this.emailQueue.addBulk(jobs);
  }

  async enqueueAutomationEvent(
    data: Record<string, unknown>,
  ) {
    return this.automationQueue.add(
      'automation-trigger',
      data,
      {
        attempts: 5,
        backoff: {
          type: 'exponential',
          delay: 1000,
        },
        removeOnComplete: 2000,
        removeOnFail: 2000,
      },
    );
  }
}
