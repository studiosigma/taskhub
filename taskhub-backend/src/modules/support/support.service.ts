import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';

@Injectable()
export class SupportService {
  constructor(private prisma: PrismaService) {}

  async createDonation(userId: string, amount: number, paymentMethod: string, message?: string) {
    return this.prisma.supportDonation.create({
      data: { userId, amount, paymentMethod, message },
    });
  }

  async myDonations(userId: string) {
    return this.prisma.supportDonation.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }
}
