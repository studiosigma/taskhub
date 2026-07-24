import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { ReportsService } from './reports.service.js';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';

@Controller('reports')
@UseGuards(JwtAuthGuard)
export class ReportsController {
  constructor(private readonly service: ReportsService) {}

  @Post()
  create(
    @CurrentUser() user: any,
    @Body('reportedUserId') reportedUserId: string,
    @Body('reason') reason: string,
    @Body('description') description?: string,
  ) {
    return this.service.create(user.id, reportedUserId, reason, description);
  }
}
