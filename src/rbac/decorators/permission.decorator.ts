import { SetMetadata } from '@nestjs/common';

export const PERMISSIONS_KEY = 'permissions';

// This decorator takes one or more permission strings
// e.g., @RequirePermission('create_post')
// e.g., @RequirePermission('edit_user', 'delete_user')
export const RequirePermission = (...permissions: string[]) => SetMetadata(PERMISSIONS_KEY, permissions);