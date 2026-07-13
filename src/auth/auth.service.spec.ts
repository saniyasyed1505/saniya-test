import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Role } from '@prisma/client';
import { UnauthorizedException, ForbiddenException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

describe('AuthService', () => {
  let service: AuthService;
  let usersService: jest.Mocked<any>;
  let jwtService: jest.Mocked<any>;
  let configService: jest.Mocked<any>;

  beforeEach(async () => {
    const mockUsersService = {
      create: jest.fn(),
      findByEmail: jest.fn(),
      findById: jest.fn(),
      updateRefreshTokenHash: jest.fn(),
    };

    const mockJwtService = {
      signAsync: jest.fn(),
    };

    const mockConfigService = {
      get: jest.fn((key: string) => {
        if (key === 'jwt.secret') return 'access-secret';
        if (key === 'jwt.refreshSecret') return 'refresh-secret';
        if (key === 'jwt.accessExpiration') return '15m';
        if (key === 'jwt.refreshExpiration') return '7d';
        return null;
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: mockUsersService },
        { provide: JwtService, useValue: mockJwtService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get(UsersService);
    jwtService = module.get(JwtService);
    configService = module.get(ConfigService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    it('should hash password and create a user', async () => {
      const password = 'raw-password';
      const mockUser = {
        id: 'user-id',
        name: 'Test User',
        email: 'test@example.com',
        role: Role.USER,
        passwordHash: 'hashed-password',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      usersService.create.mockResolvedValue(mockUser);
      jwtService.signAsync.mockResolvedValueOnce('mock-access-token');
      jwtService.signAsync.mockResolvedValueOnce('mock-refresh-token');

      const result = await service.register(mockUser.name, mockUser.email, password, mockUser.role);

      expect(usersService.create).toHaveBeenCalledWith(
        mockUser.name,
        mockUser.email,
        expect.any(String),
        mockUser.role,
      );
      expect(result).toHaveProperty('accessToken', 'mock-access-token');
      expect(result).toHaveProperty('refreshToken', 'mock-refresh-token');
    });
  });

  describe('login', () => {
    it('should return tokens if credentials match', async () => {
      const password = 'raw-password';
      const hashedPassword = await bcrypt.hash(password, 10);
      const mockUser = {
        id: 'user-id',
        name: 'Test User',
        email: 'test@example.com',
        role: Role.USER,
        passwordHash: hashedPassword,
      };

      usersService.findByEmail.mockResolvedValue(mockUser);
      jwtService.signAsync.mockResolvedValueOnce('mock-access-token');
      jwtService.signAsync.mockResolvedValueOnce('mock-refresh-token');

      const result = await service.login(mockUser.email, password);

      expect(result).toHaveProperty('accessToken', 'mock-access-token');
      expect(result).toHaveProperty('refreshToken', 'mock-refresh-token');
    });

    it('should throw UnauthorizedException if user not found', async () => {
      usersService.findByEmail.mockResolvedValue(null);
      await expect(service.login('fake@example.com', 'pwd')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException if password incorrect', async () => {
      const mockUser = {
        id: 'user-id',
        email: 'test@example.com',
        passwordHash: await bcrypt.hash('correct-password', 10),
      };
      usersService.findByEmail.mockResolvedValue(mockUser);
      await expect(service.login(mockUser.email, 'wrong-password')).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});
