import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  ManyToMany,
  JoinTable,
  OneToMany,
  Index,
  CreateDateColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Flat } from './flat.entity';
import { VisitorLog } from './visitor-log.entity';

// ... (VisitorType and GatePassStatus enums remain the same) ...
export enum VisitorType {
  GUEST = 'GUEST',
  VENDOR = 'VENDOR',
  WORKER = 'WORKER',
}
export enum GatePassStatus {
  PENDING_APPROVAL = 'PENDING_APPROVAL',
  ACTIVE = 'ACTIVE',
  USED = 'USED',
  EXPIRED = 'EXPIRED',
  CANCELED = 'CANCELED',
  WAIT_IN_LOBBY = 'WAIT_IN_LOBBY',
}

@Entity('gate_passes')
export class GatePass {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index({ unique: true })
  @Column({ unique: true, length: 10 })
  pass_code: string;

  @Column({ type: 'uuid', nullable: true })
  requester_id: string;

  // --- VISITOR DETAILS MOVED BACK HERE ---
  @Column()
  visitor_name: string;

  @Index() // Add an index for faster searching by mobile number
  @Column()
  visitor_contact_number: string;
  // ------------------------------------

  @Column({ type: 'enum', enum: VisitorType })
  visitor_type: VisitorType;

  @Column()
  visit_purpose: string;

  @Column('timestamp with time zone')
  valid_from: Date;

  @Column('timestamp with time zone')
  valid_until: Date;

  @Column({
    type: 'enum',
    enum: GatePassStatus,
    default: GatePassStatus.ACTIVE,
  })
  status: GatePassStatus;

  @ManyToOne(() => User, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'requester_id' })
  requester: User;

  // --- REMOVED LINK TO VISITOR ENTITY ---

  @ManyToMany(() => Flat, { cascade: true })
  @JoinTable({
    name: 'gate_pass_flats',
    joinColumn: { name: 'gate_pass_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'flat_id', referencedColumnName: 'id' },
  })
  destination_flats: Flat[];

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt: Date;

  @OneToMany(() => VisitorLog, (log) => log.gate_pass)
  logs: VisitorLog[];
}
