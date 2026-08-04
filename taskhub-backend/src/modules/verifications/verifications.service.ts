import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import { VerificationStatus } from '@prisma/client';

@Injectable()
export class VerificationsService {
  constructor(private prisma: PrismaService) {}

  async submit(userId: string, documentUrl: string) {
    const existing = await this.prisma.verification.findUnique({ where: { userId } });
    if (existing) {
      if (existing.status === VerificationStatus.APPROVED) {
        throw new BadRequestException('Akun Anda telah resmi terverifikasi');
      }
      return this.prisma.verification.update({
        where: { userId },
        data: {
          documentUrl,
          status: VerificationStatus.PENDING,
          rejectedReason: null,
        },
      });
    }

    return this.prisma.verification.create({
      data: { userId, documentUrl, status: VerificationStatus.PENDING },
    });
  }

  async myStatus(userId: string) {
    return this.prisma.verification.findUnique({ where: { userId } });
  }
}
