import {
  Controller,
  Get,
  UseGuards,
  Delete,
  Param,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { PermissionGuard } from 'src/rbac/guards/permission/permission.guard';
import { RequirePermission } from 'src/rbac/decorators/permission.decorator';
import { SocietiesService } from 'src/societies/societies.service';

@ApiTags('Admin - Society Management')
@ApiBearerAuth()
@UseGuards(PermissionGuard)
@Controller('admin/societies')
export class SocietiesAdminController {
  constructor(private readonly societiesService: SocietiesService) {}

  @Get()
  @RequirePermission('list_all_societies')
  @ApiOperation({
    summary: 'Get a complete list of all societies (Super Admin only)',
  })
  @ApiOkResponse({ description: 'Returns an array of all societies.' })
  @ApiForbiddenResponse({ description: 'Permission denied.' })
  findAll() {
    return this.societiesService.findAllForSuperAdmin();
  }

  @Delete(':id')
  @RequirePermission('create_society') // Re-using 'create_society' as a proxy for "super admin society powers"
  @ApiOperation({ summary: 'Delete a society (Super Admin only)' })
  @ApiOkResponse({ description: 'Society deleted successfully.' })
  @ApiForbiddenResponse({ description: 'Permission denied.' })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    await this.societiesService.remove(id);
  }
}
