import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import { VerificationStatus } from '@prisma/client';

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
      where: { status: VerificationStatus.PENDING },
      include: { user: true },
    });
  }

  async approveVerification(id: string) {
    const ver = await this.prisma.verification.findUnique({ where: { id } });
    if (!ver) throw new NotFoundException('Verification document not found');

    return this.prisma.$transaction([
      this.prisma.verification.update({
        where: { id },
        data: { status: VerificationStatus.APPROVED },
      }),
      this.prisma.user.update({
        where: { id: ver.userId },
        data: { isVerified: true },
      }),
      this.prisma.notification.create({
        data: {
          userId: ver.userId,
          title: 'Verifikasi Identitas Disetujui! 🎉',
          description: 'Selamat! Akun Anda kini telah resmi terverifikasi dengan badge centang hijau.',
        },
      }),
    ]);
  }

  async rejectVerification(id: string, reason: string) {
    const ver = await this.prisma.verification.findUnique({ where: { id } });
    if (!ver) throw new NotFoundException('Verification document not found');

    return this.prisma.$transaction([
      this.prisma.verification.update({
        where: { id },
        data: { status: VerificationStatus.REJECTED, rejectedReason: reason },
      }),
      this.prisma.notification.create({
        data: {
          userId: ver.userId,
          title: 'Verifikasi Identitas Ditolak ⚠️',
          description: `Pengajuan verifikasi Anda ditolak. Alasan: ${reason || 'Foto kurang jelas'}`,
        },
      }),
    ]);
  }
}
