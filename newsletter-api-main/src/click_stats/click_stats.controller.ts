import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { Request, Response } from 'express';
import { ClickStatService } from './click_stats.service';
import { CreateClickStatDto } from './dto/create-click_stat.dto';
import { JwtAuthGuard } from '../security/jwt-auth.guard';

@Controller('click-stats')
export class ClickStatController {
  constructor(
    private readonly clickStatService: ClickStatService,
  ) {}

  private readonly trackImg = Buffer.from(
    'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
    'base64',
  );

  @UseGuards(JwtAuthGuard)
  @Post()
  create(
    @Body()
    createClickStatDto: CreateClickStatDto,
  ) {
    return this.clickStatService.create(
      createClickStatDto,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  findAll() {
    return this.clickStatService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Get('campaign/:campaignId')
  async getCampaignStats(
    @Param('campaignId') campaignId: string,
    @Query('organizationId')
    organizationId?: string,
  ) {
    return this.clickStatService.getCampaignStats(
      campaignId,
      organizationId,
    );
  }

  @Get('t/:token')
  @Throttle({
    default: { limit: 60, ttl: 60_000 },
  })
  async trackClick(
    @Param('token') token: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const redirectUrl =
      await this.clickStatService.enqueueFromToken(
        token,
        req.ip,
        req.headers['user-agent'] || 'unknown',
      );
    return res.redirect(302, redirectUrl);
  }

  @Get('o/:token')
  @Throttle({
    default: { limit: 120, ttl: 60_000 },
  })
  async trackOpen(
    @Param('token') token: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    res.writeHead(200, {
      'Content-Type': 'image/gif',
      'Content-Length': this.trackImg.length,
      'Cache-Control':
        'no-cache, no-store, must-revalidate',
      Pragma: 'no-cache',
      Expires: '0',
    });
    res.end(this.trackImg);

    try {
      await this.clickStatService.enqueueOpenFromToken(
        token,
        req.ip,
        req.headers['user-agent'] || 'unknown',
      );
    } catch (err) {
      console.error(
        `[Tracking Error] Failed to process Open event: ${err.message}`,
      );
    }
  }
}
