import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Query,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { CreateSubscriberDto } from './dto/create-subscriber.dto';
import { UpdateSubscriberDto } from './dto/update-subscriber.dto';
import { SubscriberService } from './subscribers.service';
import { JwtAuthGuard } from '../security/jwt-auth.guard';

@Controller('subscribers')
@UseGuards(JwtAuthGuard)
export class SubscriberController {
  constructor(
    private readonly subscriberService: SubscriberService,
  ) {}

  @Post()
  create(
    @Body()
    createSubscriberDto: CreateSubscriberDto,
  ) {
    return this.subscriberService.create(
      createSubscriberDto,
    );
  }

  @Get()
  findAll(
    @Query('page', ParseIntPipe) page = 1,
    @Query('limit', ParseIntPipe) limit = 10,
  ) {
    return this.subscriberService.findAll(
      page,
      limit,
    );
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body()
    updateSubscriberDto: UpdateSubscriberDto,
  ) {
    return this.subscriberService.update(
      id,
      updateSubscriberDto,
    );
  }
}
