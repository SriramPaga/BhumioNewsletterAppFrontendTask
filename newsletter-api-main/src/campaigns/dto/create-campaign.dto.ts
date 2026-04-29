import {
  IsNotEmpty,
  IsString,
  IsUUID,
  IsOptional,
  IsUrl,
} from 'class-validator';

export class CreateCampaignDto {
  @IsNotEmpty()
  @IsString()
  subject: string;

  @IsNotEmpty()
  @IsString()
  content: string;

  @IsOptional()
  @IsUUID()
  listId?: string;

  @IsOptional()
  @IsUUID()
  organizationId?: string;

  @IsOptional()
  @IsUrl({ require_tld: false })
  targetUrl?: string;
}
