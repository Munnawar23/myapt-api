import { IntersectionType } from '@nestjs/swagger';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto';
import { ServiceRequestQueryDto } from 'src/service-requests/dto/service-request-query.dto';

export class ServiceRequestAdminQueryDto extends IntersectionType(
  PaginationQueryDto,
  ServiceRequestQueryDto,
) {}
