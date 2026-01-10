import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UserService } from './user.service';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { ConflictException, NotFoundException } from '@nestjs/common';

const mockUserRepository = {
  create: jest.fn(),
  save: jest.fn(),
  find: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
};

describe('UserService', () => {
  let service: UserService;
  let repository: Repository<User>;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    repository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const createUserDto = {
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123',
      preferredLanguage: 'en',
    };

    it('should successfully create a user', async () => {
      mockUserRepository.findOne.mockResolvedValueOnce(null);
      mockUserRepository.findOne.mockResolvedValueOnce(null);

      const savedUser = {
        id: 'uuid',
        ...createUserDto,
        passwordHash: 'hashed_password',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockUserRepository.create.mockReturnValue(savedUser);
      mockUserRepository.save.mockResolvedValue(savedUser);

      const result = await service.create(createUserDto);

      expect(result).toEqual(savedUser);
      expect(mockUserRepository.findOne).toHaveBeenCalledTimes(2);
      expect(mockUserRepository.create).toHaveBeenCalled();
      expect(mockUserRepository.save).toHaveBeenCalled();
    });

    it('should throw ConflictException if email exists', async () => {
      mockUserRepository.findOne.mockResolvedValueOnce({
        id: '1',
        email: createUserDto.email,
      });

      await expect(service.create(createUserDto)).rejects.toThrow(
        ConflictException,
      );
    });

    it('should throw ConflictException if username exists', async () => {
      mockUserRepository.findOne.mockResolvedValueOnce(null);
      mockUserRepository.findOne.mockResolvedValueOnce({
        id: '2',
        username: createUserDto.username,
      });

      await expect(service.create(createUserDto)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('findOne', () => {
    it('should return a user if found', async () => {
      const user = { id: '1', username: 'test' };
      mockUserRepository.findOne.mockResolvedValue(user);

      const result = await service.findOne('1');
      expect(result).toEqual(user);
    });

    it('should throw NotFoundException if not found', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('999')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findByEmail', () => {
    it('should return a user if found', async () => {
      const user = { id: '1', email: 'test@example.com' };
      mockUserRepository.findOne.mockResolvedValue(user);

      const result = await service.findByEmail('test@example.com');
      expect(result).toEqual(user);
    });

    it('should return null if user not found', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);
      const result = await service.findByEmail('notfound@example.com');
      expect(result).toBeNull();
    });
  });

  describe('findByUserName', () => {
    it('should return a user if found', async () => {
      const user = { id: '1', username: 'testuser' };
      mockUserRepository.findOne.mockResolvedValue(user);

      const result = await service.findByUserName('testuser');
      expect(result).toEqual(user);
    });

    it('should return null if user not found', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      const result = await service.findByUserName('notfound');
      expect(result).toBeNull();
    });
  });

  describe('findAll', () => {
    it('should return an array of user', async () => {
      const users = [
        {
          id: '1',
          username: 'user1',
          email: 'user1@test.com',
          preferredLanguage: 'en',
        },
        {
          id: '2',
          username: 'user2',
          email: 'user2@test.com',
          preferredLanguage: 'fr',
        },
      ];
      mockUserRepository.find.mockResolvedValue(users);

      const result = await service.findAll();
      expect(result).toEqual(users);
      expect(mockUserRepository.find).toHaveBeenCalledWith({
        select: [
          'id',
          'email',
          'username',
          'preferredLanguage',
          'createdAt',
          'updatedAt',
        ],
      });
    });
    it('should return empty array if no users', async () => {
      mockUserRepository.find.mockResolvedValue([]);

      const result = await service.findAll();
      expect(result).toEqual([]);
    });
  });

  describe('update', () => {
    const updateUserDto = {
      username: 'updateduser',
      preferredLanguage: 'fr',
    };
    it('should successfully update a user', async () => {
      const existingUser = {
        id: '1',
        username: 'olduser',
        email: 'test@example.com',
      };
      const updatedUser = { ...existingUser, ...updateUserDto };

      mockUserRepository.findOne
        .mockResolvedValueOnce(existingUser)
        .mockResolvedValueOnce(updatedUser);
      mockUserRepository.update.mockResolvedValue({ effected: 1 } as any);

      const result = await service.update('1', updateUserDto);

      expect(result).toEqual(updatedUser);
      expect(mockUserRepository.update).toHaveBeenCalledWith(
        '1',
        updateUserDto,
      );
    });

    it('should hash password if provided in update', async () => {
      const updateWithPassword = { password: 'newpassword123' };
      const existingUser = {
        id: '1',
        username: 'user',
        email: 'test@test.com',
      };

      mockUserRepository.findOne.mockResolvedValueOnce(existingUser);
      mockUserRepository.update.mockResolvedValue({ affected: 1 } as any);
      mockUserRepository.findOne.mockResolvedValueOnce(existingUser);

      await service.update('1', updateWithPassword);

      const updateCall = mockUserRepository.update.mock.calls[0][1];
      expect(updateCall.passwordHash).toBeDefined();
      expect(updateCall.password).toBeUndefined();
    });
  });

  describe('remove', () => {
    it('should successfully remove a user', async () => {
      const user = { id: '1', username: 'testuser' };
      mockUserRepository.findOne.mockResolvedValue(user);
      mockUserRepository.remove.mockResolvedValue(user);

      await service.remove('1');

      expect(mockUserRepository.remove).toHaveBeenCalledWith(user);
    });

    it('should throw NotFoundException if user does not exist', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(service.remove('999')).rejects.toThrow(NotFoundException);
    });
  });
});
