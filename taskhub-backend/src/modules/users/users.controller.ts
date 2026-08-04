import { Controller, Get, Patch, Body, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service.js';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';
import type { User } from '@prisma/client';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  async getMe(@CurrentUser() user: User) {
    return this.usersService.findProfile(user.id);
  }

  @Get('me/financial-summary')
  async getFinancialSummary(@CurrentUser() user: User) {
    return this.usersService.getFinancialSummary(user.id);
  }

  @Patch('me')
  async updateMe(@CurrentUser() user: User, @Body() updateDto: any) {
    return this.usersService.updateProfile(user.id, updateDto);
  }
}
