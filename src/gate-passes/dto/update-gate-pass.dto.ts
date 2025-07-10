import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsEnum } from 'class-validator';
import { GatePassStatus } from 'src/database/entities/gate-pass.entity';

export class UpdateGatePassDto {
  @ApiPropertyOptional({
    description: 'Filter service requests by status',
    enum: GatePassStatus,
  })
  @IsEnum(GatePassStatus)
  status: GatePassStatus;
}
