import { Controller, Post, Get, Param, Body, UseGuards } from '@nestjs/common';
import { ApplicationsService } from './applications.service.js';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';

@Controller()
@UseGuards(JwtAuthGuard)
export class ApplicationsController {
  constructor(private readonly service: ApplicationsService) {}

  @Post('tasks/:taskId/apply')
  apply(@Param('taskId') taskId: string, @CurrentUser() user: any, @Body('message') message?: string) {
    return this.service.apply(taskId, user.id, message);
  }

  @Get('tasks/:taskId/applications')
  findByTask(@Param('taskId') taskId: string) {
    return this.service.findByTask(taskId);
  }

  @Get('applications/my')
  myApplications(@CurrentUser() user: any) {
    return this.service.myApplications(user.id);
  }

  @Post('applications/:id/withdraw')
  withdraw(@Param('id') id: string, @CurrentUser() user: any) {
    return this.service.withdraw(id, user.id);
  }
}
