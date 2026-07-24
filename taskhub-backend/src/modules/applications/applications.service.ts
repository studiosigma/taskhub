import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';

@Injectable()
export class ApplicationsService {
  constructor(private prisma: PrismaService) {}

  async apply(taskId: string, userId: string, message?: string) {
    const task = await this.prisma.task.findUnique({ where: { id: taskId } });
    if (!task) throw new NotFoundException('Task not found');
    if (task.ownerId === userId) throw new BadRequestException('Cannot apply to own task');
    if (task.status !== 'OPEN') throw new BadRequestException('Task is not open for applications');

    const existing = await this.prisma.application.findUnique({
      where: { taskId_userId: { taskId, userId } },
    });
    if (existing) throw new BadRequestException('Already applied to this task');

    return this.prisma.application.create({
      data: { taskId, userId, message },
    });
  }

  async findByTask(taskId: string) {
    return this.prisma.application.findMany({
      where: { taskId },
      include: { user: { select: { id: true, fullName: true, avatar: true, rating: true } } },
    });
  }

  async myApplications(userId: string) {
    return this.prisma.application.findMany({
      where: { userId },
      include: { task: true },
    });
  }

  async withdraw(id: string, userId: string) {
    const app = await this.prisma.application.findUnique({ where: { id } });
    if (!app || app.userId !== userId) throw new NotFoundException('Application not found');
    if (app.status !== 'PENDING') throw new BadRequestException('Can only withdraw pending applications');
    return this.prisma.application.update({
      where: { id },
      data: { status: 'WITHDRAWN' },
    });
  }
}
