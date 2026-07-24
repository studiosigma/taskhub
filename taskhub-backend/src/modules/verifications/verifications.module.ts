import { Module } from '@nestjs/common';
import { VerificationsService } from './verifications.service.js';
import { VerificationsController } from './verifications.controller.js';
import { PrismaModule } from '../../prisma/prisma.module.js';

@Module({
  imports: [PrismaModule],
  controllers: [VerificationsController],
  providers: [VerificationsService],
})
export class VerificationsModule {}
