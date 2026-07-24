import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { PrismaService } from './../src/prisma/prisma.service';
import * as argon2 from 'argon2';

// Shared mock user data
const mockUserId = 'user-001';
const mockEmail = 'test@taskhub.com';
const mockPassword = 'Password123!';
const mockFullName = 'Test User';
let hashedPassword: string;

// Mock PrismaService for isolated e2e tests
function createMockPrisma() {
  return {
    $connect: jest.fn(),
    $disconnect: jest.fn(),
    user: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn().mockResolvedValue([]),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn().mockResolvedValue(0),
    },
    task: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn().mockResolvedValue([]),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn().mockResolvedValue(0),
    },
    category: {
      findUnique: jest.fn(),
      findMany: jest.fn().mockResolvedValue([]),
      create: jest.fn(),
    },
    application: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn().mockResolvedValue([]),
      create: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
    },
    assignment: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
    },
    review: {
      findUnique: jest.fn(),
      findMany: jest.fn().mockResolvedValue([]),
      create: jest.fn(),
      aggregate: jest.fn().mockResolvedValue({ _avg: { rating: 0 } }),
    },
    notification: {
      findMany: jest.fn().mockResolvedValue([]),
      updateMany: jest.fn(),
      create: jest.fn(),
    },
    report: {
      create: jest.fn(),
      findMany: jest.fn().mockResolvedValue([]),
    },
    supportDonation: {
      create: jest.fn(),
      findMany: jest.fn().mockResolvedValue([]),
      aggregate: jest.fn().mockResolvedValue({ _sum: { amount: 0 } }),
    },
    verification: {
      findUnique: jest.fn(),
      findMany: jest.fn().mockResolvedValue([]),
      create: jest.fn(),
      update: jest.fn(),
    },
    $transaction: jest.fn((cb: any) => cb(createMockPrisma())),
  };
}

describe('TaskHub API (e2e)', () => {
  let app: INestApplication<App>;
  let mockPrisma: ReturnType<typeof createMockPrisma>;

  beforeAll(async () => {
    hashedPassword = await argon2.hash(mockPassword);
  });

  beforeEach(async () => {
    mockPrisma = createMockPrisma();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue(mockPrisma)
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  describe('Health', () => {
    it('/ (GET) should return 404 since no root route exists', () => {
      return request(app.getHttpServer())
        .get('/')
        .expect(404);
    });

    it('/health (GET) should return health status', async () => {
      // Mock database being connected
      mockPrisma.$queryRaw = jest.fn().mockResolvedValue([{ '1': 1 }]);

      const res = await request(app.getHttpServer())
        .get('/health')
        .expect(200);

      expect(res.body.data?.status).toBe('ok');
    });
  });

  describe('Auth Flow', () => {
    it('POST /auth/register — should reject empty body', () => {
      return request(app.getHttpServer())
        .post('/auth/register')
        .send({})
        .expect(400);
    });

    it('POST /auth/register — should reject invalid email', () => {
      return request(app.getHttpServer())
        .post('/auth/register')
        .send({ fullName: 'Test', email: 'not-an-email', password: 'Password123!' })
        .expect(400);
    });

    it('POST /auth/register — should create user and return tokens', async () => {
      const mockUser = {
        id: mockUserId,
        fullName: mockFullName,
        email: mockEmail,
        phone: null,
        password: hashedPassword,
        avatar: null,
        bio: null,
        rating: 0,
        completedTask: 0,
        isVerified: false,
        role: 'USER',
        fcmToken: null,
        refreshToken: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // First findUnique returns null (no existing user)
      mockPrisma.user.findFirst.mockResolvedValue(null);
      // Then create returns the new user
      mockPrisma.user.create.mockResolvedValue(mockUser);
      // Update for refresh token
      mockPrisma.user.update.mockResolvedValue({ ...mockUser, refreshToken: 'hashed-refresh' });

      const res = await request(app.getHttpServer())
        .post('/auth/register')
        .send({ fullName: mockFullName, email: mockEmail, password: mockPassword })
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.data.accessToken).toBeDefined();
      expect(res.body.data.refreshToken).toBeDefined();
      expect(res.body.data.user.email).toBe(mockEmail);
    });

    it('POST /auth/register — should reject duplicate email', async () => {
      // Simulate existing user
      mockPrisma.user.findFirst.mockResolvedValue({ id: mockUserId, email: mockEmail });

      const res = await request(app.getHttpServer())
        .post('/auth/register')
        .send({ fullName: mockFullName, email: mockEmail, password: mockPassword })
        .expect(409);

      expect(res.body.success).toBe(false);
    });

    it('POST /auth/login — should return tokens for valid credentials', async () => {
      const mockUser = {
        id: mockUserId,
        fullName: mockFullName,
        email: mockEmail,
        password: hashedPassword,
        avatar: null,
        bio: null,
        rating: 0,
        completedTask: 0,
        isVerified: false,
        role: 'USER',
        fcmToken: null,
        refreshToken: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      mockPrisma.user.update.mockResolvedValue({ ...mockUser, refreshToken: 'hashed-refresh' });

      const res = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: mockEmail, password: mockPassword })
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.accessToken).toBeDefined();
      expect(res.body.data.refreshToken).toBeDefined();
    });

    it('POST /auth/login — should reject wrong password', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: mockUserId,
        email: mockEmail,
        password: hashedPassword,
      });

      return request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: mockEmail, password: 'WrongPassword!' })
        .expect(401);
    });
  });

  describe('Tasks API', () => {
    it('GET /tasks — should return public task list', async () => {
      mockPrisma.task.findMany.mockResolvedValue([]);
      mockPrisma.task.count.mockResolvedValue(0);

      const res = await request(app.getHttpServer())
        .get('/tasks')
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.data).toEqual([]);
    });
  });
});
