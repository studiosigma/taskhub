import { Controller, Post, Param, UseGuards } from '@nestjs/common';
import { AssignmentsService } from './assignments.service.js';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';

@Controller()
@UseGuards(JwtAuthGuard)
export class AssignmentsController {
  constructor(private readonly service: AssignmentsService) {}

  @Post('tasks/:taskId/assign/:userId')
  assign(@Param('taskId') taskId: string, @Param('userId') userId: string, @CurrentUser() user: any) {
    return this.service.assign(taskId, userId, user.id);
  }

  @Post('assignments/:id/start')
  start(@Param('id') id: string) {
    return this.service.start(id);
  }

  @Post('assignments/:id/complete')
  complete(@Param('id') id: string) {
    return this.service.complete(id);
  }
}
