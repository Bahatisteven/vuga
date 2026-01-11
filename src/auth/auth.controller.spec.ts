import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UserService } from '../user/user.service';

const mockAuthService = {
  login: jest.fn(),
};

const mockUserService = {
  create: jest.fn(),
};

describe('AuthController', () => {
  let controller: AuthController;
  //   let authService: AuthService;
  //   let userService: UserService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
        {
          provide: UserService,
          useValue: mockUserService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    // authService = module.get<AuthService>(AuthService);
    // userService = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      const createUserDto = {
        email: 'test@example.com',
        username: 'testuser',
        password: 'password123',
        preferredLanguage: 'en',
      };

      const createdUser = {
        id: '1',
        email: 'test@example.com',
        username: 'testuser',
        passwordHash: 'hashed_password',
        preferredLanguage: 'en',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockUserService.create.mockResolvedValue(createdUser);

      const result = await controller.register(createUserDto);

      expect(result.message).toBe('User registered successfully');
      expect((result.user as any).passwordHash).toBeUndefined();
      expect(result.user.id).toBe('1');
    });

    it('should throw ConflictException if email exists', async () => {
      const createUserDto = {
        email: 'existing@example.com',
        username: 'testuser',
        password: 'password123',
        preferredLanguage: 'en',
      };

      mockUserService.create.mockRejectedValue(
        new ConflictException('Email already exists'),
      );

      await expect(controller.register(createUserDto)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('login', () => {
    it('should login user and return token', () => {
      const req = {
        user: {
          id: '1',
          email: 'test@example.com',
          username: 'testuser',
          preferredLanguage: 'en',
        },
      };

      const authResponse = {
        access_token: 'jwt_token',
        user: req.user,
      };

      mockAuthService.login.mockReturnValue(authResponse);

      const result = controller.login(req);

      expect(result).toEqual(authResponse);
      expect(mockAuthService.login).toHaveBeenCalledWith(req.user);
    });
  });
});
