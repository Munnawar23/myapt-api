import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { Staff } from './staff.entity';

// Use the same LogType enum from visitor logs for consistency
import { LogType } from './visitor-log.entity';

@Entity('staff_logs')
export class StaffLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  staff_id: string;

  @Column({ type: 'enum', enum: LogType })
  log_type: LogType;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  timestamp: Date;

  // The guard who logged the event. Can be added later.
  // @Column({ type: 'uuid' })
  // guard_id: string;

  @ManyToOne(() => Staff, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'staff_id' })
  staff: Staff;
}
