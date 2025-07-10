import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { User } from './user.entity';

export enum DeliveryStatus {
  PENDING_APPROVAL = 'PENDING_APPROVAL', // Awaiting tenant action
  APPROVED = 'APPROVED', // Tenant approved, allowed entry
  DENIED = 'DENIED', // Tenant denied entry
  COMPLETED = 'COMPLETED', // Parcel delivered
}

@Entity('deliveries')
export class Delivery {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // The resident/tenant for whom the delivery is intended
  @Column({ type: 'uuid' })
  resident_id: string;

  // Details entered by security
  @Column()
  company_name: string; // e.g., 'Amazon', 'FedEx', 'Zomato'

  @Column({ nullable: true })
  tracking_id: string; // Optional parcel tracking ID

  @CreateDateColumn({ type: 'timestamp with time zone' })
  arrival_time: Date;

  @Column({
    type: 'enum',
    enum: DeliveryStatus,
    default: DeliveryStatus.PENDING_APPROVAL,
  })
  status: DeliveryStatus;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'resident_id' })
  resident: User;
}
