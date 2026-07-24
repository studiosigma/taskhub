import { Module } from '@nestjs/common';
import { ChatsService } from './chats.service.js';
import { ChatsController } from './chats.controller.js';
import { ChatsGateway } from './chats.gateway.js';
import { PrismaModule } from '../../prisma/prisma.module.js';

@Module({
  imports: [PrismaModule],
  controllers: [ChatsController],
  providers: [ChatsService, ChatsGateway],
  exports: [ChatsGateway],
})
export class ChatsModule {}
