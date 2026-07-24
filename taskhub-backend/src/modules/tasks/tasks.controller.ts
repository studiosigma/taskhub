import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, Query } from '@nestjs/common';
import { TasksService } from './tasks.service.js';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';
import type { User } from '@prisma/client';
import { Public } from '../../common/decorators/public.decorator.js';

@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@CurrentUser() user: User, @Body() createTaskDto: any) {
    return this.tasksService.create(user.id, createTaskDto);
  }

  @Public()
  @Get()
  async findAll(@Query() query: any) {
    return this.tasksService.findAll(query);
  }

  @UseGuards(JwtAuthGuard)
  @Get('my/owned')
  async getMyOwned(@CurrentUser() user: User, @Query() query: any) {
    return this.tasksService.getMyOwned(user.id, query);
  }

  @UseGuards(JwtAuthGuard)
  @Get('my/assigned')
  async getMyAssigned(@CurrentUser() user: User, @Query() query: any) {
    return this.tasksService.getMyAssigned(user.id, query);
  }

  @UseGuards(JwtAuthGuard)
  @Get('my/completed')
  async getMyCompleted(@CurrentUser() user: User, @Query() query: any) {
    return this.tasksService.getMyCompleted(user.id, query);
  }

  @Public()
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.tasksService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/publish')
  async publish(@Param('id') id: string, @CurrentUser() user: User) {
    return this.tasksService.publish(id, user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/cancel')
  async cancel(@Param('id') id: string, @CurrentUser() user: User) {
    return this.tasksService.cancel(id, user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateDto: any, @CurrentUser() user: User) {
    return this.tasksService.update(id, user.id, updateDto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async remove(@Param('id') id: string, @CurrentUser() user: User) {
    return this.tasksService.remove(id, user.id);
  }
}
