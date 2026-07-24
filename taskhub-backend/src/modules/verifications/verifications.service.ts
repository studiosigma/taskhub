import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';

@Injectable()
export class VerificationsService {
  constructor(private prisma: PrismaService) {}

  async submit(userId: string, documentUrl: string) {
    const existing = await this.prisma.verification.findUnique({ where: { userId } });
    if (existing) throw new BadRequestException('Verification already submitted');
    return this.prisma.verification.create({
      data: { userId, documentUrl },
    });
  }

  async myStatus(userId: string) {
    return this.prisma.verification.findUnique({ where: { userId } });
  }
}
