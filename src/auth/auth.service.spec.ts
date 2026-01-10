import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { UserService } from '../user/user.service';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt');

const mockUserService = {
  findByEmail: jest.fn(),
};

const mockJwtService = {
  sign: jest.fn(),
};

describe('AuthService', () => {
  let service: AuthService;
  let userService: UserService;
  let jwtService: JwtService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UserService,
          useValue: mockUserService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userService = module.get<UserService>(UserService);
    jwtService = module.get<JwtService>(JwtService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validateUser', () => {
    it('should return user without password if credentials are valid', async () => {
      const user = {
        id: '1',
        email: 'test@example.com',
        username: 'testuser',
        passwordHash: 'hashed_password',
        preferredLanguage: 'en',
      };

      mockUserService.findByEmail.mockResolvedValue(user);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.validateUser(
        'test@example.com',
        'password123',
      );

      expect(result).toEqual({
        id: '1',
        email: 'test@example.com',
        username: 'testuser',
        preferredLanguage: 'en',
      });
      expect(result.passwordHash).toBeUndefined();
    });

    it('should return null if user not found', async () => {
      mockUserService.findByEmail.mockResolvedValue(null);

      const result = await service.validateUser(
        'notfound@example.com',
        'password123',
      );

      expect(result).toBeNull();
    });

    it('should return null if password is invalid', async () => {
      const user = {
        id: '1',
        email: 'test@example.com',
        passwordHash: 'hashed_password',
      };

      mockUserService.findByEmail.mockResolvedValue(user);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      const result = await service.validateUser(
        'test@example.com',
        'wrongpassword',
      );

      expect(result).toBeNull();
    });
  });

  describe('login', () => {
    it('should return access token and user info', () => {
      const user = {
        id: '1',
        email: 'test@example.com',
        username: 'testuser',
        preferredLanguage: 'en',
      };

      mockJwtService.sign.mockReturnValue('jwt_token_here');

      const result = service.login(user);

      expect(result).toEqual({
        access_token: 'jwt_token_here',
        user: {
          id: '1',
          email: 'test@example.com',
          username: 'testuser',
          preferredLanguage: 'en',
        },
      });
      expect(mockJwtService.sign).toHaveBeenCalledWith({
        email: 'test@example.com',
        sub: '1',
        username: 'testuser',
      });
    });
  });
});
