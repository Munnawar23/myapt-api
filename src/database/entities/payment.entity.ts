import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { Invoice } from './invoice.entity';

export enum PaymentMethod {
  UPI = 'UPI',
  CARD = 'CARD',
  CASH = 'CASH',
}

export enum PaymentStatus {
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
  PENDING = 'PENDING',
}

@Entity('payments')
export class Payment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  invoice_id: string;

  // A unique ID from a payment gateway (e.g., Stripe, Razorpay)
  @Column({ unique: true })
  transaction_id: string;

  @Column('decimal', { precision: 10, scale: 2 })
  amount_paid: number;

  @Column({ type: 'enum', enum: PaymentMethod })
  payment_method: PaymentMethod;

  @Column({ type: 'enum', enum: PaymentStatus, default: PaymentStatus.SUCCESS })
  status: PaymentStatus;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  payment_date: Date;

  @ManyToOne(() => Invoice, (invoice) => invoice.payments, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'invoice_id' })
  invoice: Invoice;
}
