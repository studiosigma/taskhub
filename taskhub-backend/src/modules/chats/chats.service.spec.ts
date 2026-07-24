import { Test, TestingModule } from '@nestjs/testing';
import { ChatsService } from './chats.service.js';
import { PrismaService } from '../../prisma/prisma.service.js';
import { NotFoundException } from '@nestjs/common';

const mockPrisma = {
  conversation: {
    findMany: jest.fn(),
    findFirst: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
  message: {
    findMany: jest.fn(),
    create: jest.fn(),
  },
};

describe('ChatsService', () => {
  let service: ChatsService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChatsService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<ChatsService>(ChatsService);
  });

  const mockConversation = {
    id: 'conv-1',
    taskId: 'task-1',
    createdAt: new Date(),
    updatedAt: new Date(),
    participants: [{ userId: 'user-1', user: { id: 'user-1', fullName: 'Test', avatar: null } }],
    messages: [{ content: 'Hello', createdAt: new Date() }],
  };

  const mockMessage = {
    id: 'msg-1',
    conversationId: 'conv-1',
    senderId: 'user-1',
    content: 'Hello!',
    isRead: false,
    createdAt: new Date(),
    sender: { id: 'user-1', fullName: 'User', avatar: null },
  };

  describe('getConversations', () => {
    it('should return conversations for a user', async () => {
      mockPrisma.conversation.findMany.mockResolvedValue([mockConversation]);

      const result = await service.getConversations('user-1');

      expect(result).toHaveLength(1);
      expect(mockPrisma.conversation.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { participants: { some: { userId: 'user-1' } } },
        }),
      );
    });
  });

  describe('getMessages', () => {
    it('should return messages for a conversation the user is part of', async () => {
      mockPrisma.conversation.findFirst.mockResolvedValue(mockConversation);
      mockPrisma.message.findMany.mockResolvedValue([mockMessage]);

      const result = await service.getMessages('conv-1', 'user-1');

      expect(result).toHaveLength(1);
      expect(result[0].content).toBe('Hello!');
    });

    it('should throw if user is not a participant', async () => {
      mockPrisma.conversation.findFirst.mockResolvedValue(null);

      await expect(service.getMessages('conv-1', 'user-2')).rejects.toThrow(NotFoundException);
    });
  });

  describe('createConversation', () => {
    it('should create conversation with participants', async () => {
      mockPrisma.conversation.create.mockResolvedValue(mockConversation);

      const result = await service.createConversation('task-1', ['user-1', 'user-2']);

      expect(result.id).toBe('conv-1');
      expect(mockPrisma.conversation.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            taskId: 'task-1',
            participants: expect.objectContaining({
              create: expect.arrayContaining([
                expect.objectContaining({ userId: 'user-1' }),
              ]),
            }),
          }),
        }),
      );
    });
  });

  describe('saveMessage', () => {
    it('should create message and update conversation timestamp', async () => {
      mockPrisma.message.create.mockResolvedValue(mockMessage);
      mockPrisma.conversation.update.mockResolvedValue(mockConversation);

      const result = await service.saveMessage('conv-1', 'user-1', 'Hello!');

      expect(result.content).toBe('Hello!');
      expect(mockPrisma.conversation.update).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 'conv-1' } }),
      );
    });
  });
});
