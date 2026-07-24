import { Test, TestingModule } from '@nestjs/testing';
import { TasksService } from './tasks.service.js';
import { PrismaService } from '../../prisma/prisma.service.js';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { TaskStatus } from '@prisma/client';

const mockPrisma = {
  task: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn().mockResolvedValue(0),
  },
};

// Mock paginate helper
jest.mock('../../common/helpers/pagination.helper.js', () => ({
  paginate: jest.fn().mockResolvedValue({ data: [], meta: { total: 0, page: 1, limit: 10, totalPages: 0 } }),
}));

describe('TasksService', () => {
  let service: TasksService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TasksService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<TasksService>(TasksService);
  });

  const mockTask = {
    id: 'task-1',
    ownerId: 'user-1',
    title: 'Test Task',
    description: 'Test description',
    budget: 150000,
    duration: '3 hours',
    helperNeeded: 1,
    status: TaskStatus.OPEN,
    categoryId: 'cat-1',
    latitude: null,
    longitude: null,
    address: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockDraftTask = { ...mockTask, status: TaskStatus.DRAFT };
  const mockCancelledTask = { ...mockTask, status: TaskStatus.CANCELLED };

  describe('create', () => {
    it('should create a task with OPEN status', async () => {
      mockPrisma.task.create.mockResolvedValue(mockTask);

      const result = await service.create('user-1', { title: 'Test Task', budget: 150000 });

      expect(result.status).toBe(TaskStatus.OPEN);
      expect(mockPrisma.task.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ status: TaskStatus.OPEN, ownerId: 'user-1' }),
        }),
      );
    });
  });

  describe('findOne', () => {
    it('should return a task by id', async () => {
      mockPrisma.task.findUnique.mockResolvedValue(mockTask);

      const result = await service.findOne('task-1');

      expect(result.id).toBe('task-1');
    });

    it('should throw when task not found', async () => {
      mockPrisma.task.findUnique.mockResolvedValue(null);

      await expect(service.findOne('non-existent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('publish', () => {
    it('should change DRAFT to OPEN', async () => {
      mockPrisma.task.findUnique.mockResolvedValue(mockDraftTask);
      mockPrisma.task.update.mockResolvedValue({ ...mockDraftTask, status: TaskStatus.OPEN });

      const result = await service.publish('task-1', 'user-1');

      expect(result.status).toBe(TaskStatus.OPEN);
    });

    it('should throw if not the owner', async () => {
      mockPrisma.task.findUnique.mockResolvedValue(mockDraftTask);

      await expect(service.publish('task-1', 'other-user')).rejects.toThrow(ForbiddenException);
    });

    it('should throw if not DRAFT', async () => {
      mockPrisma.task.findUnique.mockResolvedValue(mockTask); // OPEN status

      await expect(service.publish('task-1', 'user-1')).rejects.toThrow(ForbiddenException);
    });
  });

  describe('cancel', () => {
    it('should change to CANCELLED', async () => {
      mockPrisma.task.findUnique.mockResolvedValue(mockTask);
      mockPrisma.task.update.mockResolvedValue(mockCancelledTask);

      const result = await service.cancel('task-1', 'user-1');

      expect(result.status).toBe(TaskStatus.CANCELLED);
    });

    it('should throw if not the owner', async () => {
      mockPrisma.task.findUnique.mockResolvedValue(mockTask);

      await expect(service.cancel('task-1', 'other-user')).rejects.toThrow(ForbiddenException);
    });
  });

  describe('update', () => {
    it('should update task fields', async () => {
      mockPrisma.task.findUnique.mockResolvedValue(mockTask);
      mockPrisma.task.update.mockResolvedValue({ ...mockTask, title: 'Updated' });

      const result = await service.update('task-1', 'user-1', { title: 'Updated' });

      expect(mockPrisma.task.update).toHaveBeenCalled();
    });

    it('should throw if not the owner', async () => {
      mockPrisma.task.findUnique.mockResolvedValue(mockTask);

      await expect(service.update('task-1', 'other-user', { title: 'X' })).rejects.toThrow(ForbiddenException);
    });

    it('should strip ownerId from update data', async () => {
      mockPrisma.task.findUnique.mockResolvedValue(mockTask);
      mockPrisma.task.update.mockResolvedValue(mockTask);

      await service.update('task-1', 'user-1', { title: 'Updated', ownerId: 'user-2' });

      const updateCall = mockPrisma.task.update.mock.calls[0][0];
      expect(updateCall.data.ownerId).toBeUndefined();
      expect(updateCall.data.title).toBe('Updated');
    });
  });

  describe('remove', () => {
    it('should delete task', async () => {
      mockPrisma.task.findUnique.mockResolvedValue(mockTask);
      mockPrisma.task.delete.mockResolvedValue(mockTask);

      await service.remove('task-1', 'user-1');

      expect(mockPrisma.task.delete).toHaveBeenCalledWith({ where: { id: 'task-1' } });
    });

    it('should throw if not the owner', async () => {
      mockPrisma.task.findUnique.mockResolvedValue(mockTask);

      await expect(service.remove('task-1', 'other-user')).rejects.toThrow(ForbiddenException);
    });

    it('should throw if task not found', async () => {
      mockPrisma.task.findUnique.mockResolvedValue(null);

      await expect(service.remove('non-existent', 'user-1')).rejects.toThrow(NotFoundException);
    });
  });
});
