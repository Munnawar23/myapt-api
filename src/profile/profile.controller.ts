import { Controller, Get, Put, Body, Req } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { UsersService } from '../users/users.service';
import { UpdateProfileDto } from '../users/dto/update-profile.dto';

@ApiTags('Profile')
@Controller('profile')
export class ProfileController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @ApiOperation({
    summary: "Get the current authenticated user's complete profile",
  })
  @ApiResponse({ status: 200, description: 'Returns the user profile.' })
  @ApiBearerAuth()
  getProfile(@Req() req) {
    const userId = req.user.id;
    return this.usersService.getFullProfile(userId);
  }

  @Put()
  @ApiOperation({ summary: "Update the current authenticated user's profile" })
  @ApiResponse({ status: 200, description: 'Profile updated successfully.' })
  @ApiBearerAuth()
  updateProfile(@Req() req, @Body() updateProfileDto: UpdateProfileDto) {
    const userId = req.user.id;
    return this.usersService.updateProfile(userId, updateProfileDto);
  }
}
