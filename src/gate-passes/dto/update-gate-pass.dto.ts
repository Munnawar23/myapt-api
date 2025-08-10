import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsEnum, IsNotEmpty } from 'class-validator';
import { GatePassStatus } from 'src/database/entities/gate-pass.entity';

export class UpdateGatePassDto {
  @ApiPropertyOptional({
    description: 'Filter service requests by status',
    enum: GatePassStatus,
    example: GatePassStatus.WAIT_IN_LOBBY,
  })
  @IsEnum(GatePassStatus)
  @IsNotEmpty()
  status: GatePassStatus;
}
