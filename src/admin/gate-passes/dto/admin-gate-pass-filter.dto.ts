import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID } from 'class-validator';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto';

export class AdminGatePassFilterDto extends PaginationQueryDto {
    @ApiPropertyOptional({
        description: 'Filter by status (comma-separated, e.g., ACTIVE,PENDING_APPROVAL)',
        example: 'ACTIVE,PENDING_APPROVAL',
    })
    @IsOptional()
    @IsString()
    status?: string;

    @ApiPropertyOptional({
        description: 'Filter by society ID (SuperAdmin only)',
        example: 'b7c342f7-759c-4951-ac6c-04667dcff1ce',
    })
    @IsOptional()
    @IsUUID()
    societyId?: string;
}
