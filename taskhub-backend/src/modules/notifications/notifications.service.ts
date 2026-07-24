import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import { PaginationQueryDto, PaginatedResult } from '../../common/dto/pagination.dto.js';
import { paginate } from '../../common/helpers/pagination.helper.js';

@Injectable()
export class NotificationsService {
  constructor(private prisma: PrismaService) {}

  async findByUser(userId: string, query: any = {}): Promise<PaginatedResult<any>> {
    const paginationDto: PaginationQueryDto = { page: query.page, limit: query.limit };
    return paginate(this.prisma.notification, paginationDto, {
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async markRead(id: string, userId: string) {
    return this.prisma.notification.updateMany({
      where: { id, userId },
      data: { isRead: true },
    });
  }

  async markAllRead(userId: string) {
    return this.prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
  }

  async create(userId: string, title: string, description: string) {
    return this.prisma.notification.create({
      data: { userId, title, description },
    });
  }
}
