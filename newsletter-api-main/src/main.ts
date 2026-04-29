import {
  HttpAdapterHost,
  NestFactory,
} from '@nestjs/core';
import { AppModule } from './app.module';
import {
  BadRequestException,
  Logger,
  ValidationPipe,
} from '@nestjs/common';
import { RedisIoAdapter } from './common/adapters/redis-io.adapter';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import helmet from 'helmet';
import compression from 'compression';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const redisIoAdapter = new RedisIoAdapter(app);
  await redisIoAdapter.connectToRedis();
  app.useWebSocketAdapter(redisIoAdapter);

  const httpAdapterHost = app.get(
    HttpAdapterHost,
  );
  app.useGlobalFilters(
    new AllExceptionsFilter(httpAdapterHost),
  );

  app.use(
    helmet({
      contentSecurityPolicy: false,
    }),
  );
  app.use(compression());

  const globalPrefix = 'api';
  const corsOptions = {
    credentials: true,
    origin: true,
    optionsSuccessStatus: 200,
  };

  app.setGlobalPrefix(globalPrefix);
  app.enableCors(corsOptions);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      stopAtFirstError: true,
      exceptionFactory: (errors) => {
        const messages = errors.map(
          (error) =>
            `${error.property} has failed constraints: ${Object.values(
              error.constraints || {},
            ).join(', ')}`,
        );
        return new BadRequestException(messages);
      },
    }),
  );

  const port = process.env.PORT || 8000;
  await app.listen(port);
  Logger.log(
    `🚀 Application is running on: http://localhost:${port}/${globalPrefix}`,
  );
}
bootstrap();
