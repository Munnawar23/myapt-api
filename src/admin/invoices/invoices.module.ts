import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Invoice } from 'src/database/entities/invoice.entity';
import { User } from 'src/database/entities/user.entity';
import { RbacModule } from 'src/rbac/rbac.module';
import { InvoicesAdminController } from './invoices.controller';
import { InvoicesAdminService } from './invoices.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Invoice, User]), // User is needed to generate invoices
    RbacModule,
  ],
  controllers: [InvoicesAdminController],
  providers: [InvoicesAdminService],
})
export class InvoicesAdminModule {}
