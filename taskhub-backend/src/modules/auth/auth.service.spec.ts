import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service.js';
import { PrismaService } from '../../prisma/prisma.service.js';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import * as argon2 from 'argon2';

const mockConfig = {
  get: jest.fn((key: string) => {
    const config: Record<string, string> = {
      'jwt.secret': 'test-secret',
      'jwt.refreshSecret': 'test-refresh-secret',
      'jwt.expiration': '15m',
      'jwt.refreshExpiration': '7d',
    };
    return config[key];
  }),
};

const mockJwt = {
  sign: jest.fn().mockReturnValue('mock-token'),
  verify: jest.fn().mockReturnValue({ sub: 'user-1', email: 'test@test.com', role: 'USER' }),
};

const mockPrisma = {
  user: {
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
};

describe('AuthService', () => {
  let service: AuthService;
  let testHashedPassword: string;

  beforeAll(async () => {
    testHashedPassword = await argon2.hash('Password123!');
  });

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: JwtService, useValue: mockJwt },
        { provide: ConfigService, useValue: mockConfig },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  describe('register', () => {
    const registerDto = {
      fullName: 'Test User',
      email: 'test@test.com',
      password: 'Password123!',
    };

    const mockUser = {
      id: 'user-1',
      fullName: 'Test User',
      email: 'test@test.com',
      password: '',
      phone: null,
      avatar: null,
      bio: null,
      rating: 0,
      completedTask: 0,
      isVerified: false,
      role: UserRole.USER,
      fcmToken: null,
      refreshToken: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('should register a new user successfully', async () => {
      mockPrisma.user.findFirst.mockResolvedValue(null);
      mockPrisma.user.create.mockResolvedValue(mockUser);
      mockPrisma.user.update.mockResolvedValue(mockUser);

      const result = await service.register(registerDto);

      expect(result.accessToken).toBe('mock-token');
      expect(result.refreshToken).toBe('mock-token');
      expect(result.user.email).toBe('test@test.com');
      expect(mockPrisma.user.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            email: 'test@test.com',
            fullName: 'Test User',
          }),
        }),
      );
    });

    it('should throw if email already exists', async () => {
      mockPrisma.user.findFirst.mockResolvedValue(mockUser);

      await expect(service.register(registerDto)).rejects.toThrow(BadRequestException);
    });

    it('should hash the password before storing', async () => {
      mockPrisma.user.findFirst.mockResolvedValue(null);
      mockPrisma.user.create.mockResolvedValue(mockUser);
      mockPrisma.user.update.mockResolvedValue(mockUser);

      await service.register(registerDto);

      const createCall = mockPrisma.user.create.mock.calls[0][0];
      expect(createCall.data.password).not.toBe('Password123!');
      expect(createCall.data.password).toContain('$argon2');
    });
  });

  describe('login', () => {
    const loginDto = { email: 'test@test.com', password: 'Password123!' };

    it('should return tokens for valid credentials', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'user-1',
        email: 'test@test.com',
        password: testHashedPassword,
        role: UserRole.USER,
        fullName: 'Test User',
        avatar: null,
        bio: null,
        rating: 0,
        completedTask: 0,
        isVerified: false,
        fcmToken: null,
        refreshToken: null,
        phone: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      mockPrisma.user.update.mockResolvedValue({});

      const result = await service.login(loginDto);

      expect(result.accessToken).toBe('mock-token');
      expect(result.user.email).toBe('test@test.com');
    });

    it('should throw for wrong password', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'user-1',
        email: 'test@test.com',
        password: testHashedPassword,
      });

      await expect(
        service.login({ email: 'test@test.com', password: 'WrongPass123!' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw for non-existent user', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('refresh', () => {
    const validRefreshToken = 'valid-refresh-token';
    let hashedRefreshToken: string;

    beforeAll(async () => {
      hashedRefreshToken = await argon2.hash(validRefreshToken);
    });

    it('should return new tokens for valid refresh token', async () => {
      mockJwt.verify.mockReturnValue({ sub: 'user-1', email: 'test@test.com', role: 'USER' });
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'user-1',
        email: 'test@test.com',
        refreshToken: hashedRefreshToken,
        role: UserRole.USER,
      });
      mockPrisma.user.update.mockResolvedValue({});

      const result = await service.refresh(validRefreshToken);

      expect(result.accessToken).toBeDefined();
    });

    it('should throw for invalid refresh token', async () => {
      mockJwt.verify.mockImplementation(() => { throw new Error('Invalid token'); });

      await expect(service.refresh('bad-token')).rejects.toThrow(UnauthorizedException);
    });

    it('should throw if stored refresh token is missing', async () => {
      mockJwt.verify.mockReturnValue({ sub: 'user-1', email: 'test@test.com', role: 'USER' });
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'user-1',
        email: 'test@test.com',
        refreshToken: null,
      });

      await expect(service.refresh('some-token')).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('logout', () => {
    it('should clear refresh token', async () => {
      mockPrisma.user.update.mockResolvedValue({});

      const result = await service.logout('user-1', 'some-token');

      expect(result).toBe(true);
      expect(mockPrisma.user.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'user-1' },
          data: { refreshToken: null },
        }),
      );
    });
  });
});
