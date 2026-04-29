import {
  Injectable,
  Logger,
} from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { QueueProducerService } from '../queues/queue-producer.service';

@Injectable()
export class TasksService {
  constructor(
    private readonly producer: QueueProducerService,
  ) {}
  private readonly logger = new Logger(
    TasksService.name,
  );

  @Cron('0 9 1 * *')
  async handleCron() {
    this.logger.debug(
      'Called every month at 1st Date, 9:00 AM',
    );
    await this.producer.enqueueAutomationEvent({
      type: 'monthly-report-reminder',
      to:
        process.env.REPORT_REMINDER_TO ||
        'abc@gmail.com',
      subject:
        'Reminder for collecting subscriber report',
      text: 'Hi User, Please collect the subscriber report within 3 days.',
      organizationId:
        process.env.DEFAULT_ORGANIZATION_ID,
    });
  }
}
