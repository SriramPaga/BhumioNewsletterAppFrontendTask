import {
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Index,
} from 'typeorm';

@Entity('click_events')
@Index([
  'organizationId',
  'campaignId',
  'occurredAt',
])
export class ClickEvent {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  organizationId: string;

  @Column({ type: 'uuid' })
  campaignId: string;

  @Column({ type: 'uuid' })
  listId: string;

  @Column({ type: 'uuid' })
  subscriberId: string;

  @Column({ type: 'int' })
  linkId: number;

  @Column({
    type: 'varchar',
    length: 2048,
    nullable: true,
  })
  originalUrl: string | null;

  @Column({ type: 'varchar', length: 64 })
  ipAddress: string;

  @Column({ type: 'varchar', length: 512 })
  userAgent: string;

  @Column({ type: 'varchar', length: 16 })
  eventType: 'click' | 'open';

  @Column({ type: 'timestamp' })
  occurredAt: Date;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;
}
