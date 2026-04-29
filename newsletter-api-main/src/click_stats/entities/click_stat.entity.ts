import { Campaign } from '../../campaigns/entities/campaign.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';

@Entity('click_stats')
export class ClickStat {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(
    () => Campaign,
    (campaign) => campaign.clickStats,
    {
      onDelete: 'CASCADE',
    },
  )
  campaign: Campaign;

  @Column({ type: 'varchar', length: 255 })
  link: string;

  @Column({ type: 'int', default: 0 })
  clickCount: number;

  @CreateDateColumn()
  createdAt: Date;
}
