import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ServiceRequest } from './service-request.entity';
import { Society } from './society.entity';

@Entity('services')
export class Service {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string; // e.g., 'Electrician', 'Plumber'

  @Column('text', { nullable: true })
  description: string;

  @Column('decimal', {
    precision: 10,
    scale: 2,
    comment: 'Base price or inspection fee',
  })
  base_price: number;

  @Column({ type: 'uuid' })
  society_id: string;

  @ManyToOne(() => Society, { onDelete: 'CASCADE' }) // If society is deleted, delete its services
  @JoinColumn({ name: 'society_id' })
  society: Society;

  // A service can have many requests
  @OneToMany(() => ServiceRequest, (request) => request.service)
  requests: ServiceRequest[];
}
