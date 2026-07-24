import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import { Task, TaskStatus } from '@prisma/client';
import { PaginationQueryDto, PaginatedResult } from '../../common/dto/pagination.dto.js';
import { paginate } from '../../common/helpers/pagination.helper.js';

@Injectable()
export class TasksService {
  constructor(private prisma: PrismaService) {}

  async create(ownerId: string, data: any): Promise<Task> {
    return this.prisma.task.create({
      data: { status: TaskStatus.OPEN, ...data, ownerId },
    });
  }

  async findAll(query: any): Promise<PaginatedResult<Task>> {
    const { page, limit, status, categoryId, search } = query;
    const paginationDto: PaginationQueryDto = { page, limit };

    const where: any = {};
    if (categoryId) where.categoryId = categoryId;
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    return paginate<Task>(this.prisma.task, paginationDto, {
      where,
      include: { category: true, owner: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string): Promise<Task> {
    const task = await this.prisma.task.findUnique({
      where: { id },
      include: { category: true, owner: true, photos: true },
    });
    if (!task) throw new NotFoundException('Task not found');
    return task;
  }

  async publish(id: string, userId: string): Promise<Task> {
    const task = await this.prisma.task.findUnique({ where: { id } });
    if (!task) throw new NotFoundException('Task not found');
    if (task.ownerId !== userId) throw new ForbiddenException('Only the task owner can publish this task');
    if (task.status !== TaskStatus.DRAFT) throw new ForbiddenException('Only DRAFT tasks can be published');

    return this.prisma.task.update({
      where: { id },
      data: { status: TaskStatus.OPEN },
    });
  }

  async cancel(id: string, userId: string): Promise<Task> {
    const task = await this.prisma.task.findUnique({ where: { id } });
    if (!task) throw new NotFoundException('Task not found');
    if (task.ownerId !== userId) throw new ForbiddenException('Only the task owner can cancel this task');

    return this.prisma.task.update({
      where: { id },
      data: { status: TaskStatus.CANCELLED },
    });
  }

  async getMyOwned(userId: string, query: any = {}): Promise<PaginatedResult<Task>> {
    const paginationDto: PaginationQueryDto = { page: query.page, limit: query.limit };
    return paginate<Task>(this.prisma.task, paginationDto, {
      where: { ownerId: userId },
      include: { category: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getMyAssigned(userId: string, query: any = {}): Promise<PaginatedResult<Task>> {
    const paginationDto: PaginationQueryDto = { page: query.page, limit: query.limit };
    return paginate<Task>(this.prisma.task, paginationDto, {
      where: {
        assignments: {
          some: { userId },
        },
      },
      include: { category: true, owner: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getMyCompleted(userId: string, query: any = {}): Promise<PaginatedResult<Task>> {
    const paginationDto: PaginationQueryDto = { page: query.page, limit: query.limit };
    return paginate<Task>(this.prisma.task, paginationDto, {
      where: {
        status: TaskStatus.COMPLETED,
        OR: [
          { ownerId: userId },
          { assignments: { some: { userId } } },
        ],
      },
      include: { category: true, owner: true },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async update(id: string, userId: string, data: any): Promise<Task> {
    const task = await this.prisma.task.findUnique({ where: { id } });
    if (!task) throw new NotFoundException('Task not found');
    if (task.ownerId !== userId) throw new ForbiddenException('Only the task owner can update this task');

    // Prevent changing ownerId or id
    const { id: _, ownerId, ...allowed } = data;
    return this.prisma.task.update({
      where: { id },
      data: allowed,
    });
  }

  async remove(id: string, userId: string): Promise<void> {
    const task = await this.prisma.task.findUnique({ where: { id } });
    if (!task) throw new NotFoundException('Task not found');
    if (task.ownerId !== userId) throw new ForbiddenException('Only the task owner can delete this task');

    await this.prisma.task.delete({ where: { id } });
  }
}
