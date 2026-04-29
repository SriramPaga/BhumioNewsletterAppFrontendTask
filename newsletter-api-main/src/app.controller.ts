import {
  Controller,
  Get,
  Header,
} from '@nestjs/common';
import { AppService } from './app.service';
import { readFileSync } from 'fs';
import { join } from 'path';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('dashboard')
  @Header('Content-Type', 'text/html')
  getDashboard(): string {
    const path = join(
      process.cwd(),
      'public',
      'dashboard.html',
    );
    return readFileSync(path, 'utf-8');
  }

  @Get('old-dashboard')
  @Header('Content-Type', 'text/html')
  getOldDashboard(): string {
    const path = join(
      process.cwd(),
      'public',
      'dashboard1.html',
    );
    return readFileSync(path, 'utf-8');
  }
}
