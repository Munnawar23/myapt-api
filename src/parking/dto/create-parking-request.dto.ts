import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { ParkingRequestType } from 'src/database/entities/parking-request.entity';

export class CreateParkingRequestDto {
  @ApiProperty({
    description: 'The type of request being made.',
    enum: ParkingRequestType,
  })
  @IsEnum(ParkingRequestType)
  @IsNotEmpty()
  request_type: ParkingRequestType;

  @ApiProperty({
    description: 'A detailed message about the request or issue.',
    example: 'My assigned slot is being used by another vehicle.',
  })
  @IsString()
  @IsNotEmpty()
  details: string;
}
