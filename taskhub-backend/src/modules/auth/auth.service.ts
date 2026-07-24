import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as argon2 from 'argon2';
import { PrismaService } from '../../prisma/prisma.service.js';
import { RegisterDto } from './dto/register.dto.js';
import { LoginDto } from './dto/login.dto.js';
import { AuthResponseDto } from './dto/auth-response.dto.js';
import { JwtPayload } from '../../common/interfaces/jwt-payload.interface.js';
import { UserRole } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async hashPassword(password: string): Promise<string> {
    return argon2.hash(password);
  }

  async verifyPassword(password: string, hash: string): Promise<boolean> {
    return argon2.verify(hash, password);
  }

  async generateTokens(userId: string, email: string, role: UserRole): Promise<{ accessToken: string; refreshToken: string }> {
    const payload = { sub: userId, email, role };
    const secret = this.configService.get('jwt.secret') as string;
    const refreshSecret = this.configService.get('jwt.refreshSecret') as string;
    const expiresIn = this.configService.get('jwt.expiration') as string;
    const refreshExpiresIn = this.configService.get('jwt.refreshExpiration') as string;
    const accessToken = this.jwtService.sign(payload, { secret, expiresIn } as any);
    const refreshToken = this.jwtService.sign(payload, { secret: refreshSecret, expiresIn: refreshExpiresIn } as any);

    const hashedRefreshToken = await this.hashPassword(refreshToken);
    await this.prisma.user.update({
      where: { id: userId },
      data: { refreshToken: hashedRefreshToken },
    });

    return { accessToken, refreshToken };
  }

  async register(registerDto: RegisterDto): Promise<AuthResponseDto> {
    const hashedPassword = await this.hashPassword(registerDto.password);
    const whereOr: any[] = [{ email: registerDto.email }];
    if (registerDto.phone) {
      whereOr.push({ phone: registerDto.phone });
    }

    const existingUser = await this.prisma.user.findFirst({
      where: { OR: whereOr },
    });

    if (existingUser) throw new BadRequestException('Email or phone already registered');

    const user = await this.prisma.user.create({
      data: {
        fullName: registerDto.fullName,
        email: registerDto.email,
        phone: registerDto.phone,
        password: hashedPassword,
      },
    });

    const { accessToken, refreshToken } = await this.generateTokens(user.id, user.email, user.role);
    const { password, refreshToken: userRefreshToken, ...userData } = user;
    return { accessToken, refreshToken, user: userData as any };
  }

  async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    const user = await this.prisma.user.findUnique({ where: { email: loginDto.email } });
    if (!user || !(await this.verifyPassword(loginDto.password, user.password))) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const { accessToken, refreshToken } = await this.generateTokens(user.id, user.email, user.role);
    const { password, refreshToken: userRefreshToken, ...userData } = user;
    return { accessToken, refreshToken, user: userData as any };
  }

  async refresh(providedRefreshToken: string): Promise<AuthResponseDto> {
    try {
      const decoded = this.jwtService.verify(providedRefreshToken, {
        secret: this.configService.get<string>('jwt.refreshSecret'),
      }) as JwtPayload;

      const user = await this.prisma.user.findUnique({ where: { id: decoded.sub } });
      if (!user || !user.refreshToken || !(await this.verifyPassword(providedRefreshToken, user.refreshToken))) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      const { accessToken, refreshToken } = await this.generateTokens(user.id, user.email, user.role);
      const { password, refreshToken: userRefreshToken, ...userData } = user;
      return { accessToken, refreshToken, user: userData as any };
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }

  async logout(userId: string, refreshToken: string): Promise<boolean> {
    await this.prisma.user.update({
      where: { id: userId },
      data: { refreshToken: null },
    });
    return true;
  }
}
