import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';

export enum GatePassStatus {
  ACTIVE = 'ACTIVE', // The pass is valid for an upcoming visit
  USED = 'USED', // The guest has entered
  EXPIRED = 'EXPIRED', // The visit date has passed without use
  CANCELED = 'CANCELED', // The tenant canceled the pass
}

@Entity('gate_passes')
export class GatePass {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // The tenant who created the pass
  @Column({ type: 'uuid' })
  requester_id: string;

  @Column()
  guest_name: string;

  @Column({ nullable: true })
  guest_contact_number: string;

  @Column('timestamp with time zone')
  visit_date: Date;

  @Column({
    type: 'enum',
    enum: GatePassStatus,
    default: GatePassStatus.ACTIVE,
  })
  status: GatePassStatus;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'requester_id' })
  requester: User;
}
