import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Flat } from './flat.entity';

@Entity('family_members')
export class FamilyMember {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Foreign key to the Flat this member belongs to
  @Column({ type: 'uuid' })
  flat_id: string;

  @Column()
  full_name: string;

  @Column()
  relationship: string; // e.g., 'Spouse', 'Child'

  @ManyToOne(() => Flat, (flat) => flat.family_members, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'flat_id' })
  flat: Flat;
}
