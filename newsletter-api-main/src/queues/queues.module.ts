import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { QueueNames } from './queue.constants';
import { QueueProducerService } from './queue-producer.service';
import { ClickEventsProcessor } from './processors/click-events.processor';
import { EmailEventsProcessor } from './processors/email-events.processor';
import { AutomationEventsProcessor } from './processors/automation-events.processor';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClickEvent } from '../click_stats/entities/click_event.entity';
import { ClickStat } from '../click_stats/entities/click_stat.entity';
import { Campaign } from '../campaigns/entities/campaign.entity';
import { EmailModule } from '../email/email.module';
import { RealtimeModule } from '../realtime/realtime.module';
import { QueuesController } from './queues.controller';

@Module({
  imports: [
    BullModule.registerQueue(
      { name: QueueNames.CLICK },
      { name: QueueNames.EMAIL },
      { name: QueueNames.AUTOMATION },
      { name: QueueNames.DLQ },
    ),
    TypeOrmModule.forFeature([
      ClickEvent,
      ClickStat,
      Campaign,
    ]),
    EmailModule,
    RealtimeModule,
  ],
  providers: [
    QueueProducerService,
    ClickEventsProcessor,
    EmailEventsProcessor,
    AutomationEventsProcessor,
  ],
  controllers: [QueuesController],
  exports: [QueueProducerService, BullModule],
})
export class QueuesModule {}
