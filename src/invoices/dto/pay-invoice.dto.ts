import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { PaymentMethod } from 'src/database/entities/payment.entity';

export class PayInvoiceDto {
  @ApiProperty({
    description: 'The method used for payment.',
    enum: PaymentMethod,
    example: PaymentMethod.UPI,
  })
  @IsEnum(PaymentMethod)
  @IsNotEmpty()
  payment_method: PaymentMethod;
}
