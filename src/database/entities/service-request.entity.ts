import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Service } from './service.entity';

export enum ServiceRequestStatus {
  OPEN = 'OPEN',
  IN_PROGRESS = 'IN_PROGRESS',
  RESOLVED = 'RESOLVED',
  CLOSED = 'CLOSED',
  CANCELED = 'CANCELED',
}


export enum ServiceRequestPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
}

@Entity('service_requests')
export class ServiceRequest {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  user_id: string;

  @Column({ type: 'uuid' })
  service_id: string;

  @Column('timestamp with time zone', { nullable: true })
  start_time: Date;

  @Column('timestamp with time zone', { nullable: true })
  end_time: Date;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  created_at: Date;

  @Column('text', { nullable: true })
  additional_notes: string;

  @Column({
    type: 'enum',
    enum: ServiceRequestStatus,
    default: ServiceRequestStatus.OPEN,
  })
  status: ServiceRequestStatus;

  @Column({
    type: 'enum',
    enum: ServiceRequestPriority,
    default: ServiceRequestPriority.MEDIUM,
  })
  priority: ServiceRequestPriority;

  @Column({ type: 'uuid', nullable: true })
  technician_id: string;

  @Column({ type: 'text', nullable: true })
  admin_comments: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Service, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'service_id' })
  service: Service;

  @ManyToOne(() => User, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'technician_id' })
  assigned_technician: User;
}

