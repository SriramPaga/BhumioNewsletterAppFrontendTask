import { Global, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrganizationsModule } from './organizations/organizations.module';
import { UserModule } from './users/users.module';
import { SubscribersModule } from './subscribers/subscribers.module';
import { ListsModule } from './lists/lists.module';
import { CampaignsModule } from './campaigns/campaigns.module';
import { ClickStatsModule } from './click_stats/click_stats.module';
import { AuthModule } from './auth/auth.module';
import { Campaign } from './campaigns/entities/campaign.entity';
import { List } from './lists/entities/list.entity';
import { ClickStat } from './click_stats/entities/click_stat.entity';
import { Organization } from './organizations/entities/organization.entity';
import { Subscriber } from './subscribers/entities/subscriber.entity';
import { Email } from './email/entities/email.entity';
import { User } from './users/entities/user.entity';
import { Link } from './click_stats/entities/link.entity';
import { EmailModule } from './email/email.module';
import { ScheduleModule } from '@nestjs/schedule';
import { TasksModule } from './tasks/task.module';
import { KnexModule } from 'nestjs-knex';
import { ConfigModule } from '@nestjs/config';
import { ClickEvent } from './click_stats/entities/click_event.entity';
import { BullModule } from '@nestjs/bullmq';
import { QueuesModule } from './queues/queues.module';
import { RealtimeModule } from './realtime/realtime.module';
import { SecurityModule } from './security/security.module';
import {
  ThrottlerGuard,
  ThrottlerModule,
} from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';

@Global()
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [
        '.env',
        `src/.${process.env.NODE_ENV || 'test'}.env`,
        'src/.test.env',
      ],
    }),
    BullModule.forRoot({
      connection: {
        host:
          process.env.REDIS_HOST || '127.0.0.1',
        port: Number(
          process.env.REDIS_PORT || 6379,
        ),
      },
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60_000,
        limit: 120,
      },
    ]),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host:
        process.env.POSTGRES_HOST || 'localhost',
      port: Number(
        process.env.POSTGRES_PORT || 5432,
      ),
      username:
        process.env.POSTGRES_USER || 'postgres',
      password:
        process.env.POSTGRES_PASSWORD || '123',
      database:
        process.env.POSTGRES_DB || 'NewsLetter',
      entities: [
        Campaign,
        ClickStat,
        ClickEvent,
        List,
        Organization,
        Subscriber,
        User,
        Email,
        Link,
      ],
      synchronize:
        (process.env.TYPEORM_SYNCHRONIZE ||
          'true') === 'true',
    }),
    KnexModule.forRoot({
      config: {
        client: 'pg',
        connection: {
          host:
            process.env.POSTGRES_HOST ||
            'localhost',
          port: Number(
            process.env.POSTGRES_PORT || 5432,
          ),
          user:
            process.env.POSTGRES_USER ||
            'postgres',
          password:
            process.env.POSTGRES_PASSWORD ||
            '123',
          database:
            process.env.POSTGRES_DB ||
            'NewsLetter',
        },
        pool: { min: 2, max: 10 },
      },
    }),
    OrganizationsModule,
    UserModule,
    SubscribersModule,
    ListsModule,
    CampaignsModule,
    ClickStatsModule,
    AuthModule,
    EmailModule,
    QueuesModule,
    RealtimeModule,
    SecurityModule,
    ScheduleModule.forRoot(),
    TasksModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
