import { Controller, Post, Get, Body, UseGuards } from '@nestjs/common';
import { SupportService } from './support.service.js';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';

@Controller('support')
@UseGuards(JwtAuthGuard)
export class SupportController {
  constructor(private readonly service: SupportService) {}

  @Post('donations')
  createDonation(
    @CurrentUser() user: any,
    @Body('amount') amount: number,
    @Body('paymentMethod') paymentMethod: string,
    @Body('message') message?: string,
  ) {
    return this.service.createDonation(user.id, amount, paymentMethod, message);
  }

  @Get('donations/my')
  myDonations(@CurrentUser() user: any) {
    return this.service.myDonations(user.id);
  }
}
