import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';

@Injectable()
export class ReportsService {
  constructor(private prisma: PrismaService) {}

  async create(reporterId: string, reportedUserId: string, reason: string, description?: string) {
    return this.prisma.report.create({
      data: { reporterId, reportedUserId, reason, description },
    });
  }
}
