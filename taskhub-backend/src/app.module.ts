import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { PrismaModule } from './prisma/prisma.module.js';
import appConfig from './config/app.config.js';
import jwtConfig from './config/jwt.config.js';
import r2Config from './config/r2.config.js';
import firebaseConfig from './config/firebase.config.js';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard.js';
import { AuthModule } from './modules/auth/auth.module.js';
import { UsersModule } from './modules/users/users.module.js';
import { TasksModule } from './modules/tasks/tasks.module.js';
import { CategoriesModule } from './modules/categories/categories.module.js';
import { UploadModule } from './modules/upload/upload.module.js';
import { ApplicationsModule } from './modules/applications/applications.module.js';
import { AssignmentsModule } from './modules/assignments/assignments.module.js';
import { ReviewsModule } from './modules/reviews/reviews.module.js';
import { ReportsModule } from './modules/reports/reports.module.js';
import { NotificationsModule } from './modules/notifications/notifications.module.js';
import { SupportModule } from './modules/support/support.module.js';
import { VerificationsModule } from './modules/verifications/verifications.module.js';
import { AdminModule } from './modules/admin/admin.module.js';
import { HealthModule } from './health/health.module.js';
import { ChatsModule } from './modules/chats/chats.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, jwtConfig, r2Config, firebaseConfig],
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 10,
      },
    ]),
    PrismaModule,
    AuthModule,
    UsersModule,
    TasksModule,
    CategoriesModule,
    UploadModule,
    ApplicationsModule,
    AssignmentsModule,
    ReviewsModule,
    ReportsModule,
    NotificationsModule,
    SupportModule,
    VerificationsModule,
    AdminModule,
    ChatsModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}


