import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { User } from './user.entity';
import { Permission } from './permission.entity';

@Entity('roles')
export class Role {
  @PrimaryGeneratedColumn()
  role_id: number;

  @Column({ unique: true })
  role_name: string;

  // This is the "owning" side of the User-Role relationship
  @ManyToMany(() => User, (user) => user.roles)
  users: User[];

  // This is the "owning" side of the Role-Permission relationship
  // TypeORM will automatically create the 'role_permissions' join table
  @ManyToMany(() => Permission, (permission) => permission.roles, {
    cascade: true,
  })
  @JoinTable({
    name: 'role_permissions',
    joinColumn: { name: 'role_id', referencedColumnName: 'role_id' },
    inverseJoinColumn: {
      name: 'permission_id',
      referencedColumnName: 'permission_id',
    },
  })
  permissions: Permission[];
}
