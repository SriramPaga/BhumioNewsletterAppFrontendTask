import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
} from '@nestjs/common';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { OrganizationService } from './organizations.service';
import { RolesGuard } from '../auth/roles.guard';
import { JwtAuthGuard } from '../security/jwt-auth.guard';

@Controller('organizations')
@UseGuards(JwtAuthGuard, RolesGuard)
export class OrganizationController {
  constructor(
    private readonly organizationService: OrganizationService,
  ) {}

  @Post()
  async create(
    @Body()
    createOrganizationDto: CreateOrganizationDto,
  ) {
    const data =
      await this.organizationService.create(
        createOrganizationDto,
      );
    return data;
  }

  @Get()
  findAll() {
    return this.organizationService.findAll();
  }
}
