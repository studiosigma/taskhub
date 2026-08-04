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

  private calculateHaversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth radius in km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) *
        Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c * 10) / 10; // Rounded to 1 decimal place
  }

  async findAll(query: any): Promise<PaginatedResult<Task>> {
    const { page, limit, status, categoryId, search, lat, lng, radiusKm } = query;
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

    const result = await paginate<Task>(this.prisma.task, paginationDto, {
      where,
      include: { category: true, owner: true, photos: true },
      orderBy: { createdAt: 'desc' },
    });

    if (lat && lng) {
      const userLat = parseFloat(lat);
      const userLng = parseFloat(lng);
      const radius = radiusKm ? parseFloat(radiusKm) : Infinity;

      result.data = result.data
        .map((task: any) => {
          const taskLat = task.latitude || -6.2088;
          const taskLng = task.longitude || 106.8456;
          const distanceKm = this.calculateHaversineDistance(userLat, userLng, taskLat, taskLng);
          return { ...task, distanceKm };
        })
        .filter((task: any) => task.distanceKm <= radius)
        .sort((a: any, b: any) => a.distanceKm - b.distanceKm);
    }

    return result;
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
