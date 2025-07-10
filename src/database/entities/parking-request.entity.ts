import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { User } from './user.entity';

export enum ParkingRequestType {
  CHANGE_REQUEST = 'CHANGE_REQUEST',
  ISSUE_REPORT = 'ISSUE_REPORT',
  SPOT_REQUEST = 'SPOT_REQUEST',
}

@Entity('parking_requests')
export class ParkingRequest {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  requester_id: string;

  @Column({ type: 'enum', enum: ParkingRequestType })
  request_type: ParkingRequestType;

  @Column('text')
  details: string; // User's message explaining the issue or request

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'requester_id' })
  requester: User;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt: Date;
}
