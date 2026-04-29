import {
  OnWorkerEvent,
  Processor,
  WorkerHost,
} from '@nestjs/bullmq';
import { InjectQueue } from '@nestjs/bullmq';
import { Job, Queue } from 'bullmq';
import { QueueNames } from '../queue.constants';
import { QueueProducerService } from '../queue-producer.service';

@Processor(QueueNames.AUTOMATION)
export class AutomationEventsProcessor extends WorkerHost {
  constructor(
    private readonly producer: QueueProducerService,
    @InjectQueue(QueueNames.DLQ)
    private readonly dlqQueue: Queue,
  ) {
    super();
  }

  async process(
    job: Job<Record<string, unknown>>,
  ) {
    if (
      job.data.type === 'monthly-report-reminder'
    ) {
      await this.producer.enqueueEmailEvent({
        to: job.data.to,
        subject: job.data.subject,
        text: job.data.text,
        organizationId: job.data.organizationId,
      });
    }
  }

  @OnWorkerEvent('failed')
  async onFailed(
    job: Job<Record<string, unknown>> | undefined,
    err: Error,
  ) {
    if (!job) return;
    await this.dlqQueue.add('automation-dlq', {
      queue: QueueNames.AUTOMATION,
      name: job.name,
      data: job.data,
      reason: err.message,
      failedAt: new Date().toISOString(),
    });
  }
}
