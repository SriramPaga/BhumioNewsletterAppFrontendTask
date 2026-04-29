import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClickStatController } from './click_stats.controller';
import { ClickStatService } from './click_stats.service';
import { ClickStat } from './entities/click_stat.entity';
import { Campaign } from '../campaigns/entities/campaign.entity';
import { Link } from './entities/link.entity';
import { List } from '../lists/entities/list.entity';
import { Subscriber } from '../subscribers/entities/subscriber.entity';
import { ClickEvent } from './entities/click_event.entity';
import { QueuesModule } from '../queues/queues.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ClickStat,
      ClickEvent,
      Campaign,
      Link,
      List,
      Subscriber,
    ]),
    QueuesModule,
  ],
  controllers: [ClickStatController],
  providers: [ClickStatService],
  exports: [ClickStatService],
})
export class ClickStatsModule {}
