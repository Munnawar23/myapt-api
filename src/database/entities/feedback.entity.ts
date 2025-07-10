import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Society } from './society.entity';

// Type can distinguish between general feedback, complaints, or suggestions
export enum FeedbackType {
  FEEDBACK = 'FEEDBACK',
  SUGGESTION = 'SUGGESTION',
  COMPLAINT = 'COMPLAINT',
}

@Entity('feedback')
export class Feedback {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  user_id: string;

  // Rating out of 5, for example
  @Column('integer', { nullable: true })
  rating: number;

  @Column('text')
  comment: string;

  @Column({ type: 'uuid' })
  society_id: string;

  // Optional field to categorize the feedback
  @Column({
    type: 'enum',
    enum: FeedbackType,
    default: FeedbackType.FEEDBACK,
  })
  type: FeedbackType;

  // Optional field for image URL if a user attaches a photo
  @Column({ nullable: true })
  image_url: string;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  submitted_at: Date;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Society, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'society_id' })
  society: Society;
}
