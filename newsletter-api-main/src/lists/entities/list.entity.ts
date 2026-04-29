import { Campaign } from '../../campaigns/entities/campaign.entity';
import { Organization } from '../../organizations/entities/organization.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('lists')
export class List {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @ManyToOne(
    () => Organization,
    (organization) => organization.lists,
    {
      onDelete: 'CASCADE',
    },
  )
  organization: Organization;

  @Column('jsonb', { nullable: true })
  customFields: object;

  @OneToMany(
    () => Campaign,
    (campaign) => campaign.list,
  )
  campaigns: Campaign[];

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}
