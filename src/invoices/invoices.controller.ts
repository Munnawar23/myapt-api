import {
  Controller,
  Get,
  Post,
  Body,
  Req,
  Param,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { InvoicesService } from './invoices.service';
import { PayInvoiceDto } from './dto/pay-invoice.dto';

@ApiTags('Invoices')
@Controller('invoices')
export class InvoicesController {
  constructor(private readonly invoicesService: InvoicesService) {}

  @Get()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all invoices for the authenticated user' })
  findForUser(@Req() req) {
    const userId = req.user.id;
    return this.invoicesService.findForUser(userId);
  }

  @Post(':id/pay')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Process payment for a specific invoice' })
  pay(
    @Req() req,
    @Param('id', ParseUUIDPipe) invoiceId: string,
    @Body() payInvoiceDto: PayInvoiceDto,
  ) {
    const userId = req.user.id;
    return this.invoicesService.pay(
      userId,
      invoiceId,
      payInvoiceDto.payment_method,
    );
  }
}
