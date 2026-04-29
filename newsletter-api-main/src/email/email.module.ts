import { Module } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';
import {
  ConfigModule,
  ConfigService,
} from '@nestjs/config';
import { EmailService } from './email.service';
import { EmailController } from './email.controller';

@Module({
  imports: [
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        transport: {
          host: config.get<string>(
            'MAILGUN_HOST',
            'smtp.gmail.com',
          ),
          port: config.get<number>(
            'MAILGUN_PORT',
            587,
          ),
          secure: false,
          auth: {
            user: config.get<string>(
              'MAILGUN_USER',
            ),
            pass: config.get<string>(
              'MAILGUN_PASS',
            ),
          },
        },
        defaults: {
          from: config.get<string>(
            'MAILGUN_FROM',
            'Newsletter <noreply@localhost>',
          ),
        },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [EmailService],
  controllers: [EmailController],
  exports: [EmailService],
})
export class EmailModule {}
