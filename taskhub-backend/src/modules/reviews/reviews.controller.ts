import { Controller, Post, Get, Param, Body, UseGuards } from '@nestjs/common';
import { ReviewsService } from './reviews.service.js';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';

@Controller()
@UseGuards(JwtAuthGuard)
export class ReviewsController {
  constructor(private readonly service: ReviewsService) {}

  @Post('tasks/:taskId/reviews')
  create(
    @Param('taskId') taskId: string,
    @CurrentUser() user: any,
    @Body('rating') rating: number,
    @Body('comment') comment?: string,
  ) {
    return this.service.create(taskId, user.id, rating, comment);
  }

  @Get('users/:userId/reviews')
  findByUser(@Param('userId') userId: string) {
    return this.service.findByUser(userId);
  }
}
