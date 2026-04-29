import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CampaignService } from './campaigns.service';
import { CampaignController } from './campaigns.controller';
import { Campaign } from './entities/campaign.entity';
import { List } from '../lists/entities/list.entity';
import { Organization } from '../organizations/entities/organization.entity';
import { AuthModule } from '../auth/auth.module';
import { ListsModule } from '../lists/lists.module';
import { Link } from '../click_stats/entities/link.entity';
import { QueuesModule } from '../queues/queues.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Campaign,
      List,
      Organization,
      Link,
    ]),
    AuthModule,
    ListsModule,
    QueuesModule,
  ],
  controllers: [CampaignController],
  providers: [CampaignService],
  exports: [CampaignService],
})
export class CampaignsModule {}
