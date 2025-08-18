import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  Index,
} from 'typeorm';
import { User } from './user.entity';

export enum DeliveryStatus {
  EXPECTED = 'EXPECTED', // Tenant has pre-registered this delivery
  PENDING_APPROVAL = 'PENDING_APPROVAL', // Guard created, awaiting tenant action
  APPROVED = 'APPROVED', // Tenant approved, allowed entry
  DENIED = 'DENIED', // Tenant denied entry
  COMPLETED = 'COMPLETED', // Parcel delivered/handed over
  CANCELED = 'CANCELED', // Canceled by tenant
}

// To track who created the record
export enum DeliveryCreator {
  TENANT = 'TENANT',
  GUARD = 'GUARD',
}

@Entity('deliveries')
export class Delivery {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  resident_id: string;

  @Column()
  company_name: string; // e.g., 'Amazon', 'FedEx', 'Zomato'

  // NEW: A searchable Order ID provided by the tenant
  @Index()
  @Column({ nullable: true })
  order_id: string;

  // NEW: An optional OTP for verification
  @Column({ nullable: true })
  otp: string;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  arrival_time: Date;

  @Column({
    type: 'enum',
    enum: DeliveryStatus,
    default: DeliveryStatus.EXPECTED,
  })
  status: DeliveryStatus;

  // NEW: Track who created this entry
  @Column({
    type: 'enum',
    enum: DeliveryCreator,
  })
  created_by: DeliveryCreator;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'resident_id' })
  resident: User;
}
