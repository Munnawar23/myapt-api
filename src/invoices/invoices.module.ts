import { Module } from '@nestjs/common';
import { InvoicesService } from './invoices.service';
import { InvoicesController } from './invoices.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Payment } from 'src/database/entities/payment.entity';
import { Invoice } from '../database/entities/invoice.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Invoice, Payment])],
  controllers: [InvoicesController],
  providers: [InvoicesService],
})
export class InvoicesModule {}
