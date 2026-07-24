import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async dashboard() {
    const [users, tasks, completedTasks, donations] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.task.count(),
      this.prisma.task.count({ where: { status: 'COMPLETED' } }),
      this.prisma.supportDonation.aggregate({ _sum: { amount: true } }),
    ]);

    return { users, tasks, completedTasks, totalDonations: donations._sum.amount ?? 0 };
  }

  async getAllUsers() {
    return this.prisma.user.findMany({ orderBy: { createdAt: 'desc' } });
  }

  async getAllReports() {
    return this.prisma.report.findMany({
      include: { reporter: true, reportedUser: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getPendingVerifications() {
    return this.prisma.verification.findMany({
      where: { status: 'PENDING' },
      include: { user: true },
    });
  }

  async approveVerification(id: string) {
    const ver = await this.prisma.verification.findUnique({ where: { id } });
    if (!ver) throw new Error('Not found');
    return this.prisma.$transaction([
      this.prisma.verification.update({ where: { id }, data: { status: 'APPROVED' } }),
      this.prisma.user.update({ where: { id: ver.userId }, data: { isVerified: true } }),
    ]);
  }

  async rejectVerification(id: string, reason: string) {
    return this.prisma.verification.update({ where: { id }, data: { status: 'REJECTED', rejectedReason: reason } });
  }
}
