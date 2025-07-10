import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Invoice, InvoiceStatus } from 'src/database/entities/invoice.entity';
import { Payment, PaymentMethod } from 'src/database/entities/payment.entity';
import { Repository } from 'typeorm';
import { randomBytes } from 'crypto';

@Injectable()
export class InvoicesService {
  constructor(
    @InjectRepository(Invoice) private invoicesRepository: Repository<Invoice>,
    @InjectRepository(Payment) private paymentsRepository: Repository<Payment>,
  ) {}

  // Get all invoices for a user
  async findForUser(userId: string): Promise<Invoice[]> {
    return this.invoicesRepository.find({
      where: { user_id: userId },
      order: { due_date: 'DESC' },
    });
  }

  // Process payment for an invoice
  async pay(
    userId: string,
    invoiceId: string,
    paymentMethod: PaymentMethod,
  ): Promise<Payment> {
    const invoice = await this.invoicesRepository.findOneBy({
      id: invoiceId,
      user_id: userId,
    });

    if (!invoice) {
      throw new NotFoundException(
        `Invoice with ID ${invoiceId} not found for this user.`,
      );
    }

    if (invoice.status === InvoiceStatus.PAID) {
      throw new ConflictException('This invoice has already been paid.');
    }

    // --- In a real app, you would integrate with a payment gateway here ---
    // For this simulation, we'll assume the payment was successful.

    // 1. Create a mock transaction record
    const newPayment = this.paymentsRepository.create({
      invoice_id: invoiceId,
      amount_paid: invoice.amount,
      payment_method: paymentMethod,
      transaction_id: `txn_${randomBytes(12).toString('hex')}`, // Generate a random mock transaction ID
    });
    const savedPayment = await this.paymentsRepository.save(newPayment);

    // 2. Update the invoice status to PAID
    invoice.status = InvoiceStatus.PAID;
    await this.invoicesRepository.save(invoice);

    return savedPayment;
  }
}
