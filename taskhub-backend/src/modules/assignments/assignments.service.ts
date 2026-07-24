import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';

@Injectable()
export class AssignmentsService {
  constructor(private prisma: PrismaService) {}

  async assign(taskId: string, userId: string, ownerId: string) {
    const task = await this.prisma.task.findUnique({ where: { id: taskId } });
    if (!task) throw new NotFoundException('Task not found');
    if (task.ownerId !== ownerId) throw new BadRequestException('Only task owner can assign');
    if (task.status !== 'OPEN') throw new BadRequestException('Task is not open');

    const app = await this.prisma.application.findUnique({
      where: { taskId_userId: { taskId, userId } },
    });
    if (!app || app.status !== 'PENDING') throw new BadRequestException('Application not found or not pending');

    const [_, assignment] = await this.prisma.$transaction([
      this.prisma.application.updateMany({
        where: { taskId, status: 'PENDING' },
        data: { status: 'REJECTED' },
      }),
      this.prisma.assignment.create({ data: { taskId, userId } }),
      this.prisma.task.update({
        where: { id: taskId },
        data: { status: 'ASSIGNED' },
      }),
    ]);

    return assignment;
  }

  async start(id: string) {
    const assignment = await this.prisma.assignment.findUnique({ where: { id } });
    if (!assignment) throw new NotFoundException('Assignment not found');
    return this.prisma.task.update({
      where: { id: assignment.taskId },
      data: { status: 'IN_PROGRESS' },
    });
  }

  async complete(id: string) {
    const assignment = await this.prisma.assignment.findUnique({ where: { id } });
    if (!assignment) throw new NotFoundException('Assignment not found');
    return this.prisma.$transaction([
      this.prisma.task.update({
        where: { id: assignment.taskId },
        data: { status: 'COMPLETED' },
      }),
      this.prisma.user.update({
        where: { id: assignment.userId },
        data: { completedTask: { increment: 1 } },
      }),
    ]);
  }
}
