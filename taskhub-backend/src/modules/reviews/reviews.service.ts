import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';

@Injectable()
export class ReviewsService {
  constructor(private prisma: PrismaService) {}

  async create(taskId: string, reviewerId: string, rating: number, comment?: string) {
    const task = await this.prisma.task.findUnique({ where: { id: taskId } });
    if (!task || task.status !== 'COMPLETED') throw new BadRequestException('Task not completed');
    if (task.ownerId !== reviewerId) throw new BadRequestException('Only task owner can review');

    const existing = await this.prisma.review.findUnique({
      where: { taskId_reviewerId: { taskId, reviewerId } },
    });
    if (existing) throw new BadRequestException('Already reviewed this task');

    const assignment = await this.prisma.assignment.findFirst({ where: { taskId } });
    if (!assignment) throw new NotFoundException('No helper found');

    const review = await this.prisma.review.create({
      data: { taskId, reviewerId, reviewedUserId: assignment.userId, rating, comment },
    });

    const agg = await this.prisma.review.aggregate({
      where: { reviewedUserId: assignment.userId },
      _avg: { rating: true },
    });
    await this.prisma.user.update({
      where: { id: assignment.userId },
      data: { rating: agg._avg.rating ?? 0 },
    });

    return review;
  }

  async findByUser(userId: string) {
    return this.prisma.review.findMany({
      where: { reviewedUserId: userId },
      include: { reviewer: { select: { id: true, fullName: true, avatar: true } } },
    });
  }
}
