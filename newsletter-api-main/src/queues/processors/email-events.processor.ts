import { Logger } from '@nestjs/common';
import {
  OnWorkerEvent,
  Processor,
  WorkerHost,
} from '@nestjs/bullmq';
import { InjectQueue } from '@nestjs/bullmq';
import { Job, Queue } from 'bullmq';
import { QueueNames } from '../queue.constants';
import { EmailService } from '../../email/email.service';
import { StatsGateway } from '../../realtime/stats.gateway';

interface EmailJobData {
  to: string;
  subject: string;
  text: string;
  organizationId?: string;
}

@Processor(QueueNames.EMAIL, { concurrency: 50 })
export class EmailEventsProcessor extends WorkerHost {
  private readonly logger = new Logger(
    EmailEventsProcessor.name,
  );

  constructor(
    private readonly emailService: EmailService,
    @InjectQueue(QueueNames.DLQ)
    private readonly dlqQueue: Queue,
    private readonly statsGateway: StatsGateway,
  ) {
    super();
  }

  async process(job: Job<EmailJobData>) {
    try {
      await this.emailService.sendEmail(
        job.data.to,
        job.data.subject,
        job.data.text,
      );
      if (job.data.organizationId) {
        this.statsGateway.emitTenantEvent(
          job.data.organizationId,
          'email.processed',
          {
            to: job.data.to,
            subject: job.data.subject,
            processedAt: new Date().toISOString(),
          },
        );
      }
    } catch (err) {
      this.logger.error(
        `Email send failed to ${job.data.to}: ${err.message}`,
        err.stack,
      );
      throw err;
    }
  }

  @OnWorkerEvent('failed')
  async onFailed(
    job: Job<EmailJobData> | undefined,
    err: Error,
  ) {
    if (!job) return;
    await this.dlqQueue.add('email-dlq', {
      queue: QueueNames.EMAIL,
      name: job.name,
      data: job.data,
      reason: err.message,
      failedAt: new Date().toISOString(),
    });
  }
}
