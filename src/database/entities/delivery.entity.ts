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
  EXPECTED = 'EXPECTED', // User has pre-registered this delivery
  PENDING_APPROVAL = 'PENDING_APPROVAL', // Guard created, awaiting user action
  APPROVED = 'APPROVED', // User approved, allowed entry
  DENIED = 'DENIED', // User denied entry
  COMPLETED = 'COMPLETED', // Parcel delivered/handed over
  CANCELED = 'CANCELED', // Canceled by user
}

// To track who created the record
export enum DeliveryCreator {
  USER = 'USER',
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
