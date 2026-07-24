import { Controller, Get, Post, Param, Body, UseGuards } from '@nestjs/common';
import { ChatsService } from './chats.service.js';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';

@Controller('chats')
@UseGuards(JwtAuthGuard)
export class ChatsController {
  constructor(private readonly chatsService: ChatsService) {}

  @Get('conversations')
  getConversations(@CurrentUser() user: any) {
    return this.chatsService.getConversations(user.id);
  }

  @Get('conversations/:id/messages')
  getMessages(@Param('id') id: string, @CurrentUser() user: any) {
    return this.chatsService.getMessages(id, user.id);
  }

  @Post('conversations')
  createConversation(@Body('taskId') taskId: string, @Body('userIds') userIds: string[]) {
    return this.chatsService.createConversation(taskId, userIds);
  }

  @Post('conversations/:id/messages')
  sendMessage(@Param('id') id: string, @CurrentUser() user: any, @Body('content') content: string) {
    return this.chatsService.saveMessage(id, user.id, content);
  }

  @Get('conversations/:id')
  async getConversation(@Param('id') id: string, @CurrentUser() user: any) {
    return this.chatsService.getConversation(id, user.id);
  }
}
