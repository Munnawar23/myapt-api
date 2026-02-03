import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Society } from './society.entity';

@Entity('announcements')
export class Announcement {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column('text')
  content: string;

  @Column({ type: 'uuid' })
  society_id: string;

  @ManyToOne(() => Society, { onDelete: 'CASCADE' }) // If society is deleted, delete its announcements
  @JoinColumn({ name: 'society_id' })
  society: Society;

  @Column({ default: false })
  is_published: boolean;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt: Date;
}
