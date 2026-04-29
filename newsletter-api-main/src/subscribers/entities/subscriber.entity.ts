import { Organization } from '../../organizations/entities/organization.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('subscribers')
export class Subscriber {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  email: string;

  @ManyToOne(
    () => Organization,
    (organization) => organization.subscribers,
    { onDelete: 'CASCADE' },
  )
  organization: Organization;

  @Column('jsonb', { nullable: true })
  customFields: object;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}
