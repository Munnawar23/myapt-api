import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  JoinColumn,
  ManyToOne,
} from 'typeorm';
import { AmenityBooking } from './amenity-booking.entity';
import { ApiProperty } from '@nestjs/swagger';
import { AmenitySlot } from './amenity-slot.entity';
import { Society } from './society.entity';

@Entity('amenities')
export class Amenity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column('text', { nullable: true })
  description: string;

  @Column('decimal', { precision: 10, scale: 2, default: 0.0 })
  price: number;

  @Column('decimal', { precision: 10, scale: 2, default: 0.0 })
  tax_percent: number;

  @Column('decimal', { precision: 10, scale: 2, default: 0.0 })
  service_fee: number;

  @Column('text', { nullable: true })
  additional_notes: string;

  @ApiProperty({
    description: 'Time when the amenity opens',
    example: '09:00:00',
  })
  @Column('time', { default: '09:00:00' })
  opening_time: string;

  @ApiProperty({
    description: 'Time when the amenity closes',
    example: '21:00:00',
  })
  @Column('time', { default: '21:00:00' })
  closing_time: string;

  @ApiProperty({ description: 'Duration of each slot in minutes', example: 60 })
  @Column('integer', { default: 60 })
  slot_duration_minutes: number;

  @ApiProperty({
    description: 'Maximum number of bookings per slot',
    example: 10,
  })
  @Column('integer', { default: 10 })
  slot_capacity: number;

  // An amenity now has many slots
  @OneToMany(() => AmenitySlot, (slot) => slot.amenity)
  slots: AmenitySlot[];

  @Column({ type: 'uuid' })
  society_id: string;

  @ManyToOne(() => Society, { onDelete: 'CASCADE' }) // If society is deleted, delete its amenities
  @JoinColumn({ name: 'society_id' })
  society: Society;
}
