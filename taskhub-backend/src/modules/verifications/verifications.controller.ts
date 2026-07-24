import { Controller, Post, Get, Body, UseGuards } from '@nestjs/common';
import { VerificationsService } from './verifications.service.js';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';

@Controller('verifications')
@UseGuards(JwtAuthGuard)
export class VerificationsController {
  constructor(private readonly service: VerificationsService) {}

  @Post()
  submit(@CurrentUser() user: any, @Body('documentUrl') documentUrl: string) {
    return this.service.submit(user.id, documentUrl);
  }

  @Get('my')
  myStatus(@CurrentUser() user: any) {
    return this.service.myStatus(user.id);
  }
}
