import { Controller, Get, Patch, Param, Body, UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service.js';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import { AdminGuard } from '../../common/guards/admin.guard.js';

@Controller('admin')
@UseGuards(JwtAuthGuard, AdminGuard)
export class AdminController {
  constructor(private readonly service: AdminService) {}

  @Get('dashboard')
  dashboard() {
    return this.service.dashboard();
  }

  @Get('users')
  users() {
    return this.service.getAllUsers();
  }

  @Get('reports')
  reports() {
    return this.service.getAllReports();
  }

  @Get('verifications')
  verifications() {
    return this.service.getPendingVerifications();
  }

  @Patch('verifications/:id/approve')
  approveVerification(@Param('id') id: string) {
    return this.service.approveVerification(id);
  }

  @Patch('verifications/:id/reject')
  rejectVerification(@Param('id') id: string, @Body('reason') reason: string) {
    return this.service.rejectVerification(id, reason);
  }
}
