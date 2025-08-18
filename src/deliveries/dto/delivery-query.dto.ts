import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { DeliveryStatus } from 'src/database/entities/delivery.entity';

export class DeliveryQueryDto {
  @ApiPropertyOptional({
    description: 'Filter deliveries by status.',
    enum: DeliveryStatus,
  })
  @IsOptional()
  @IsEnum(DeliveryStatus)
  status?: DeliveryStatus;
}
