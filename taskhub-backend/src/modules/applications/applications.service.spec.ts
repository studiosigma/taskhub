import { Test, TestingModule } from '@nestjs/testing';
import { ApplicationsService } from './applications.service.js';
import { PrismaService } from '../../prisma/prisma.service.js';
import { NotFoundException, BadRequestException } from '@nestjs/common';

const mockPrisma = {
  task: { findUnique: jest.fn() },
  application: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
};

describe('ApplicationsService', () => {
  let service: ApplicationsService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ApplicationsService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<ApplicationsService>(ApplicationsService);
  });

  const mockTask = {
    id: 'task-1',
    ownerId: 'owner-1',
    status: 'OPEN',
    title: 'Test Task',
  };

  const mockApplication = {
    id: 'app-1',
    taskId: 'task-1',
    userId: 'helper-1',
    message: 'I can help!',
    status: 'PENDING',
    createdAt: new Date(),
  };

  describe('apply', () => {
    it('should create application successfully', async () => {
      mockPrisma.task.findUnique.mockResolvedValue(mockTask);
      mockPrisma.application.findUnique.mockResolvedValue(null);
      mockPrisma.application.create.mockResolvedValue(mockApplication);

      const result = await service.apply('task-1', 'helper-1', 'I can help!');

      expect(result.userId).toBe('helper-1');
      expect(mockPrisma.application.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ taskId: 'task-1', userId: 'helper-1' }),
        }),
      );
    });

    it('should throw if task not found', async () => {
      mockPrisma.task.findUnique.mockResolvedValue(null);

      await expect(service.apply('non-existent', 'user-1')).rejects.toThrow(NotFoundException);
    });

    it('should throw if applying to own task', async () => {
      mockPrisma.task.findUnique.mockResolvedValue(mockTask);

      await expect(service.apply('task-1', 'owner-1')).rejects.toThrow(BadRequestException);
    });

    it('should throw if task is not OPEN', async () => {
      mockPrisma.task.findUnique.mockResolvedValue({ ...mockTask, status: 'IN_PROGRESS' });

      await expect(service.apply('task-1', 'helper-1')).rejects.toThrow(BadRequestException);
    });

    it('should throw if already applied', async () => {
      mockPrisma.task.findUnique.mockResolvedValue(mockTask);
      mockPrisma.application.findUnique.mockResolvedValue(mockApplication);

      await expect(service.apply('task-1', 'helper-1')).rejects.toThrow(BadRequestException);
    });
  });

  describe('findByTask', () => {
    it('should return applications for a task', async () => {
      mockPrisma.application.findMany.mockResolvedValue([mockApplication]);

      const result = await service.findByTask('task-1');

      expect(result).toHaveLength(1);
      expect(mockPrisma.application.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { taskId: 'task-1' } }),
      );
    });
  });

  describe('myApplications', () => {
    it('should return applications by user', async () => {
      mockPrisma.application.findMany.mockResolvedValue([mockApplication]);

      const result = await service.myApplications('helper-1');

      expect(result).toHaveLength(1);
    });
  });

  describe('withdraw', () => {
    it('should withdraw a pending application', async () => {
      mockPrisma.application.findUnique.mockResolvedValue(mockApplication);
      mockPrisma.application.update.mockResolvedValue({ ...mockApplication, status: 'WITHDRAWN' });

      const result = await service.withdraw('app-1', 'helper-1');

      expect(result.status).toBe('WITHDRAWN');
    });

    it('should throw if application not found', async () => {
      mockPrisma.application.findUnique.mockResolvedValue(null);

      await expect(service.withdraw('non-existent', 'user-1')).rejects.toThrow(NotFoundException);
    });

    it('should throw if not the applicant', async () => {
      mockPrisma.application.findUnique.mockResolvedValue(mockApplication);

      await expect(service.withdraw('app-1', 'other-user')).rejects.toThrow(NotFoundException);
    });
  });
});
