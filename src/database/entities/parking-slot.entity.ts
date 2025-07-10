import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToOne,
} from 'typeorm';
import { ParkingZone } from './parking-zone.entity';
import { User } from './user.entity';

@Entity('parking_slots')
export class ParkingSlot {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  slot_number: string; // e.g., 'P305'

  @Column({ nullable: true })
  level_description: string; // e.g., 'Level 3, Near main Entrance'

  @Column({ type: 'uuid' })
  zone_id: string;

  // Can be null if the slot is unassigned/available
  @Column({ type: 'uuid', nullable: true, unique: true })
  assigned_to_user_id: string | null;

  @ManyToOne(() => ParkingZone, (zone) => zone.slots, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'zone_id' })
  zone: ParkingZone;

  @OneToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'assigned_to_user_id' })
  assigned_user: User;
}
