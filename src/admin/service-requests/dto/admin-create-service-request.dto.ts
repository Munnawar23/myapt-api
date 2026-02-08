import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID } from 'class-validator';
import { CreateServiceRequestDto } from 'src/service-requests/dto/create-service-request.dto';

export class AdminCreateServiceRequestDto extends CreateServiceRequestDto {
    @ApiProperty({
        description: 'The ID of the resident for whom the request is being created.',
        example: '804213e1-44d7-40a6-a3e4-cbc717ce7b52',
    })
    @IsUUID()
    @IsNotEmpty()
    user_id: string;
}
