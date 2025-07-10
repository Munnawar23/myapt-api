import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { ServiceRequestStatus } from 'src/database/entities/service-request.entity';

export class ServiceRequestQueryDto {
  @ApiPropertyOptional({
    description: 'Filter service requests by status',
    enum: ServiceRequestStatus,
  })
  @IsOptional()
  @IsEnum(ServiceRequestStatus)
  status?: ServiceRequestStatus;
}
