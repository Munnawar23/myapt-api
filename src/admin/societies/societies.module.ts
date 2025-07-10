import { Module } from '@nestjs/common';
import { RbacModule } from 'src/rbac/rbac.module';
import { SocietiesModule } from 'src/societies/societies.module'; // We need access to the service
import { SocietiesAdminController } from './societies.controller';

@Module({
  imports: [RbacModule, SocietiesModule], // Import SocietiesModule to use its providers
  controllers: [SocietiesAdminController],
})
export class SocietiesAdminModule {}
