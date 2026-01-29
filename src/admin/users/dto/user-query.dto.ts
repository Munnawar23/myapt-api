import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsUUID } from 'class-validator';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto';

export class UserQueryDto extends PaginationQueryDto {
    @ApiPropertyOptional({
        description: 'Filter users by society ID',
        example: '655c4977-a2c3-421f-a4f4-c2edb29828e1',
    })
    @IsOptional()
    @IsUUID()
    societyId?: string;
}
