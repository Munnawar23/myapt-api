import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsUUID, isUUID } from 'class-validator';
import { ServiceRequestStatus } from 'src/database/entities/service-request.entity';

export class UpdateServiceRequestDto {
  @ApiProperty({
    description: 'The new status for the service request.',
    enum: ServiceRequestStatus,
    example: ServiceRequestStatus.IN_PROGRESS,
  })
  @IsEnum(ServiceRequestStatus)
  @IsNotEmpty()
  status: ServiceRequestStatus;
}
