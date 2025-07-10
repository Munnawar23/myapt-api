import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';
import { AmenitySlot } from './amenity-slot.entity'; // Import the new slot entity

export enum BookingStatus {
  CONFIRMED = 'CONFIRMED', // Changed from UPCOMING to be more explicit
  COMPLETED = 'COMPLETED',
  CANCELED = 'CANCELED',
}

@Entity('amenity_bookings')
export class AmenityBooking {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  user_id: string;

  // --- FIELD CHANGES ---
  // We now link directly to a slot instead of an amenity and a date
  @Column({ type: 'uuid' })
  slot_id: string;

  @Column({
    type: 'enum',
    enum: BookingStatus,
    default: BookingStatus.CONFIRMED,
  })
  status: BookingStatus;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  // This relationship is key. A booking belongs to one specific slot.
  @ManyToOne(() => AmenitySlot, (slot) => slot.bookings, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'slot_id' })
  slot: AmenitySlot;
}
