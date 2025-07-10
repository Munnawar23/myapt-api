import { Entity, PrimaryGeneratedColumn, Column, ManyToMany } from 'typeorm';
import { Role } from './role.entity';

@Entity('permissions')
export class Permission {
  @PrimaryGeneratedColumn()
  permission_id: number;

  @Column({ unique: true })
  permission_name: string;

  @Column({ nullable: true })
  description: string;

  // This defines the reverse side of the relationship, but it's not the owner
  @ManyToMany(() => Role, (role) => role.permissions)
  roles: Role[];
}
