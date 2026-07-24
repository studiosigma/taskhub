import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';

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
}
