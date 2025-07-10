import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
  Unique,
} from 'typeorm';
import { Amenity } from './amenity.entity';
import { AmenityBooking } from './amenity-booking.entity';

@Entity('amenity_slots')
@Unique(['amenity_id', 'start_time'])
export class AmenitySlot {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  amenity_id: string;

  @Column('timestamp with time zone')
  start_time: Date;

  @Column('timestamp with time zone')
  end_time: Date;

  @Column('integer', { default: 0 })
  booked_count: number;

  @Column('boolean', { default: true })
  is_active: boolean; // Admin can set this to false for maintenance

  @ManyToOne(() => Amenity, (amenity) => amenity.slots, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'amenity_id' })
  amenity: Amenity;

  // A slot can have many individual bookings (up to its capacity)
  @OneToMany(() => AmenityBooking, (booking) => booking.slot)
  bookings: AmenityBooking[];
}
