import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { ParkingSlot } from './parking-slot.entity';

@Entity('parking_zones')
export class ParkingZone {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string; // e.g., 'Zone A', 'Zone B', 'Visitor Parking'

  @Column('integer')
  total_capacity: number;

  // A zone can have many parking slots
  @OneToMany(() => ParkingSlot, (slot) => slot.zone)
  slots: ParkingSlot[];
}
