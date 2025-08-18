import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Flat } from './flat.entity';
import { StaffLog } from './staff-log.entity';

// e.g., Maid, Cook, Driver, Nanny
export enum StaffType {
  MAID = 'MAID',
  COOK = 'COOK',
  DRIVER = 'DRIVER',
  NANNY = 'NANNY',
  OTHER = 'OTHER',
}

@Entity('staff')
export class Staff {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  flat_id: string;

  @Column()
  full_name: string;

  @Column({ nullable: true })
  contact_number: string;

  @Column({
    type: 'enum',
    enum: StaffType,
  })
  staff_type: StaffType;

  // A staff member belongs to one flat
  @ManyToOne(() => Flat, (flat) => flat.staff, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'flat_id' })
  flat: Flat;

  @OneToMany(() => StaffLog, (log) => log.staff)
  logs: StaffLog[];
}
