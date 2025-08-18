import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
  OneToMany,
  ManyToOne,
} from 'typeorm';
import { User } from './user.entity';
import { FamilyMember } from './family-member.entity';
import { Staff } from './staff.entity';

@Entity('flats')
export class Flat {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  flat_number: string;

  @Column()
  block: string; // e.g., 'Tower A', 'Building C'

  // Foreign key to the User who owns this flat
  @Column({ type: 'uuid' })
  owner_id: string;

  // A flat is owned by one user
  @OneToOne(() => User, (user) => user.owned_flat, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'owner_id' })
  owner: User;

  // A flat can have many family members
  @OneToMany(() => FamilyMember, (member) => member.flat)
  family_members: FamilyMember[];

  @OneToMany(() => Staff, (staff) => staff.flat)
  staff: Staff[];
}
