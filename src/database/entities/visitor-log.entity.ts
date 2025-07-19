import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { GatePass } from './gate-pass.entity';

export enum LogType {
  ENTRY = 'ENTRY',
  EXIT = 'EXIT',
}

@Entity('visitor_logs')
export class VisitorLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  gate_pass_id: string;

  @Column({ type: 'enum', enum: LogType })
  log_type: LogType;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  timestamp: Date;

  // The guard who logged the event. We can add this relation later.
  // @Column({ type: 'uuid' })
  // guard_id: string;

  @ManyToOne(() => GatePass, (pass) => pass.logs, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'gate_pass_id' })
  gate_pass: GatePass;
}
