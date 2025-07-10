import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToMany,
  JoinTable,
  OneToOne,
  JoinColumn,
  ManyToOne,
} from 'typeorm';
import { Role } from './role.entity';
import { Flat } from './flat.entity';
import { Society } from './society.entity';

export enum UserSocietyStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string; // Renamed from 'user_id' to align with the brief

  @Column()
  full_name: string;

  @Column({ unique: true })
  email: string; // Changed from 'username' to be the primary login identifier

  @Column()
  password_hash?: string;

  @Column({ nullable: true })
  phone_number: string;

  @ManyToMany(() => Role, { cascade: true, eager: true }) // Eager load roles for convenience
  @JoinTable({
    name: 'user_roles',
    joinColumn: { name: 'user_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'role_id', referencedColumnName: 'role_id' },
  })
  roles: Role[];

  // A user can be the owner of one flat
  @OneToOne(() => Flat, (flat) => flat.owner)
  owned_flat: Flat;

  @Column({ type: 'uuid', nullable: true })
  society_id: string;

  @Column({
    type: 'enum',
    enum: UserSocietyStatus,
    nullable: true, // A user might not have applied to a society yet
  })
  society_status: UserSocietyStatus;

  @ManyToOne(() => Society, (society) => society.users, {
    nullable: true,
    onDelete: 'SET NULL', // If a society is deleted, don't delete the user
  })
  @JoinColumn({ name: 'society_id' })
  society: Society;
}
