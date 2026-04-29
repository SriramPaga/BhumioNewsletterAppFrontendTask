import { Controller, Get } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { QueueNames } from './queue.constants';

@Controller('queues')
export class QueuesController {
  constructor(
    @InjectQueue(QueueNames.CLICK)
    private readonly clickQueue: Queue,
    @InjectQueue(QueueNames.EMAIL)
    private readonly emailQueue: Queue,
    @InjectQueue(QueueNames.AUTOMATION)
    private readonly automationQueue: Queue,
    @InjectQueue(QueueNames.DLQ)
    private readonly dlqQueue: Queue,
  ) {}

  @Get('health')
  async getQueueHealth() {
    const [click, email, automation, dlq] =
      await Promise.all([
        this.clickQueue.getJobCounts(),
        this.emailQueue.getJobCounts(),
        this.automationQueue.getJobCounts(),
        this.dlqQueue.getJobCounts(),
      ]);

    return { click, email, automation, dlq };
  }
}
