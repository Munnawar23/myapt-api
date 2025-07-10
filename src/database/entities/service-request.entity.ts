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
  PENDING = 'PENDING', // User has requested the service
  CONFIRMED = 'CONFIRMED', // Admin has confirmed the time slot
  ASSIGNED = 'ASSIGNED', // Admin has assigned a specific staff member
  IN_PROGRESS = 'IN_PROGRESS', // Staff has started the work
  COMPLETED = 'COMPLETED', // Work is done
  CANCELED = 'CANCELED', // Canceled by user or admin
}

@Entity('service_requests')
export class ServiceRequest {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  user_id: string;

  @Column({ type: 'uuid' })
  service_id: string;

  @Column('timestamp with time zone')
  start_time: Date;

  @Column('timestamp with time zone')
  end_time: Date;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  created_at: Date;

  @Column('text', { nullable: true })
  additional_notes: string;

  @Column({
    type: 'enum',
    enum: ServiceRequestStatus,
    default: ServiceRequestStatus.PENDING,
  })
  status: ServiceRequestStatus;

  @Column({ type: 'uuid', nullable: true })
  technician_id: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Service, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'service_id' })
  service: Service;

  @ManyToOne(() => User, {
    nullable: true,
    onDelete: 'SET NULL', // If a technician's user account is deleted, just nullify the assignment
  })
  @JoinColumn({ name: 'technician_id' })
  assigned_technician: User;
}
