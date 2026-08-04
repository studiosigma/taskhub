import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import { TaskStatus } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findProfile(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');
    const { password, refreshToken, ...profile } = user;
    return profile;
  }

  async updateProfile(userId: string, data: any) {
    return this.prisma.user.update({ where: { id: userId }, data });
  }

  async getFinancialSummary(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    // 1. Helper Earnings (tasks completed where user was assigned as helper)
    const helperTasks = await this.prisma.task.findMany({
      where: {
        status: TaskStatus.COMPLETED,
        assignments: { some: { userId } },
      },
      include: { category: true, owner: { select: { fullName: true, avatar: true } } },
      orderBy: { updatedAt: 'desc' },
    });

    const totalEarnings = helperTasks.reduce(
      (acc, t) => acc + Number(t.budget || 0),
      0
    );

    // 2. Owner Spending (tasks completed where user was the owner)
    const ownerTasks = await this.prisma.task.findMany({
      where: {
        ownerId: userId,
        status: TaskStatus.COMPLETED,
      },
      include: { category: true },
      orderBy: { updatedAt: 'desc' },
    });

    const totalSpent = ownerTasks.reduce(
      (acc, t) => acc + Number(t.budget || 0),
      0
    );

    // 3. Combined Recent Transactions
    const helperTransactions = helperTasks.map((t) => ({
      id: t.id,
      title: t.title,
      amount: Number(t.budget),
      category: t.category?.name || 'Umum',
      role: 'HELPER',
      type: 'EARNING',
      date: t.updatedAt,
      counterpartyName: t.owner?.fullName || 'Task Owner',
    }));

    const ownerTransactions = ownerTasks.map((t) => ({
      id: t.id,
      title: t.title,
      amount: Number(t.budget),
      category: t.category?.name || 'Umum',
      role: 'OWNER',
      type: 'EXPENSE',
      date: t.updatedAt,
      counterpartyName: 'Helper Assigned',
    }));

    const recentTransactions = [...helperTransactions, ...ownerTransactions].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    return {
      totalEarnings,
      totalSpent,
      completedAsHelperCount: helperTasks.length,
      completedAsOwnerCount: ownerTasks.length,
      recentTransactions,
    };
  }
}
