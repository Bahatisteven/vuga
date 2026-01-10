import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { UserService } from './user.service';
import { UserControllers } from './user.controller';

const mockUserService = {
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
};

describe('UserControllers', () => {
  let controller: UserControllers;
  let service: UserService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserControllers],
      providers: [
        {
          provide: UserService,
          useValue: mockUserService,
        },
      ],
    }).compile();

    controller = module.get<UserControllers>(UserControllers);
    service = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getProfile', () => {
    it('should return user profile', async () => {
      const userId = 'uuid-123';
      const user = {
        id: userId,
        username: 'testuser',
        email: 'test@example.com',
        preferredLanguage: 'en',
      };

      mockUserService.findOne.mockResolvedValue(user);

      const result = await controller.getProfile(userId);

      expect(result).toEqual(user);
      expect(mockUserService.findOne).toHaveBeenCalledWith(userId);
    });

    it('should throw NotFoundException if user not found', async () => {
      mockUserService.findOne.mockRejectedValue(
        new NotFoundException('User with ID 999 not found'),
      );

      await expect(controller.getProfile('999')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('updateProfile', () => {
    it('should update user profile', async () => {
      const userId = 'uuid-123';
      const updateDto = {
        username: 'newusername',
        preferredLanguage: 'fr',
      };
      const updatedUser = {
        id: userId,
        ...updateDto,
        email: 'test@example.com',
      };

      mockUserService.update.mockResolvedValue(updatedUser);

      const result = await controller.updateProfile(userId, updateDto);

      expect(result).toEqual(updatedUser);
      expect(mockUserService.update).toHaveBeenCalledWith(userId, updateDto);
    });
  });

  describe('deleteAccount', () => {
    it('should delete user account', async () => {
      const userId = 'uuid-123';
      mockUserService.remove.mockResolvedValue(undefined);

      await controller.deleteAccount(userId);

      expect(mockUserService.remove).toHaveBeenCalledWith(userId);
    });
  });
});
