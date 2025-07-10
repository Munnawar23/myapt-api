import {
  Controller,
  Get,
  Query,
  UseGuards,
  Post,
  Body,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PermissionGuard } from 'src/rbac/guards/permission/permission.guard';
import { RequirePermission } from 'src/rbac/decorators/permission.decorator';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto';
import { InvoicesAdminService } from './invoices.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';

@ApiTags('Admin - Invoice Management')
@ApiBearerAuth()
@UseGuards(PermissionGuard)
@Controller('admin/invoices')
export class InvoicesAdminController {
  constructor(private readonly invoicesService: InvoicesAdminService) {}

  @Get()
  @ApiOperation({ summary: "View all invoices for the admin's society" })
  @RequirePermission('manage_invoices')
  findAll(@Query() query: PaginationQueryDto, @Request() req) {
    return this.invoicesService.findAll(query, req.user);
  }

  @Post()
  @ApiOperation({
    summary: "Generate a new invoice for a resident in the admin's society",
  })
  @RequirePermission('manage_invoices')
  create(@Body() createDto: CreateInvoiceDto, @Request() req) {
    return this.invoicesService.create(createDto, req.user);
  }
}
