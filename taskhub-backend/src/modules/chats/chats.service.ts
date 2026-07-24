import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';

@Injectable()
export class ChatsService {
  constructor(private prisma: PrismaService) {}

  async getConversations(userId: string) {
    return this.prisma.conversation.findMany({
      where: { participants: { some: { userId } } },
      include: {
        participants: { include: { user: { select: { id: true, fullName: true, avatar: true } } } },
        messages: { take: 1, orderBy: { createdAt: 'desc' } },
        task: { select: { id: true, title: true } },
      },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async getMessages(conversationId: string, userId: string) {
    const conv = await this.prisma.conversation.findFirst({
      where: { id: conversationId, participants: { some: { userId } } },
    });
    if (!conv) throw new NotFoundException('Conversation not found');
    return this.prisma.message.findMany({
      where: { conversationId },
      include: { sender: { select: { id: true, fullName: true, avatar: true } } },
      orderBy: { createdAt: 'asc' },
    });
  }

  async createConversation(taskId: string, userIds: string[]) {
    const conv = await this.prisma.conversation.create({
      data: {
        taskId,
        participants: { create: userIds.map(id => ({ userId: id })) },
      },
      include: { participants: { include: { user: { select: { id: true, fullName: true, avatar: true } } } } },
    });
    return conv;
  }

  async saveMessage(conversationId: string, senderId: string, content: string) {
    const message = await this.prisma.message.create({
      data: { conversationId, senderId, content },
      include: { sender: { select: { id: true, fullName: true, avatar: true } } },
    });
    await this.prisma.conversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() },
    });
    return message;
  }

  async getConversation(conversationId: string, userId: string) {
    const conv = await this.prisma.conversation.findFirst({
      where: { id: conversationId, participants: { some: { userId } } },
      include: {
        participants: { include: { user: { select: { id: true, fullName: true, avatar: true } } } },
        messages: { take: 1, orderBy: { createdAt: 'desc' } },
        task: { select: { id: true, title: true } },
      },
    });
    if (!conv) throw new NotFoundException('Conversation not found');
    return conv;
  }
}
