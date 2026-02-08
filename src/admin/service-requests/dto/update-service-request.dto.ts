import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';

import { ServiceRequestStatus, ServiceRequestPriority } from '../../../database/entities/service-request.entity';


export class UpdateServiceRequestDto {
  @ApiProperty({
    description: 'The new status for the service request.',
    enum: ServiceRequestStatus,
    example: ServiceRequestStatus.IN_PROGRESS,
    required: false,
  })
  @IsEnum(ServiceRequestStatus)
  @IsOptional()
  status?: ServiceRequestStatus;

  @ApiProperty({
    description: 'The priority of the service request.',
    enum: ServiceRequestPriority,
    example: ServiceRequestPriority.HIGH,
    required: false,
  })
  @IsEnum(ServiceRequestPriority)
  @IsOptional()
  priority?: ServiceRequestPriority;

  @ApiProperty({
    description: 'Comments from the admin/staff.',
    example: 'Scheduled for tomorrow morning.',
    required: false,
  })
  @IsString()
  @IsOptional()
  admin_comments?: string;
}

