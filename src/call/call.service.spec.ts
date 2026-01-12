import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CallService } from './call.service';
import { Call, CallStatus } from './entities';
import { CallLog } from './entities';
import { UserService } from '../user/user.service';
import {
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';

const mockCallRepository = {
  create: jest.fn(),
  save: jest.fn(),
  findOne: jest.fn(),
  findAndCount: jest.fn(),
};

const mockCallLogRepository = {
  create: jest.fn(),
  save: jest.fn(),
  find: jest.fn(),
};

const mockUserService = {
  findOne: jest.fn(),
};

describe('CallService', () => {
  let service: CallService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CallService,
        {
          provide: getRepositoryToken(Call),
          useValue: mockCallRepository,
        },
        {
          provide: getRepositoryToken(CallLog),
          useValue: mockCallLogRepository,
        },
        {
          provide: UserService,
          useValue: mockUserService,
        },
      ],
    }).compile();

    service = module.get<CallService>(CallService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('InitiateCall', () => {
    const initiateCallDto = {
      calleeId: 'callee-uuid',
      callerLanguage: 'en',
    };

    it('should successfully initiate a call', async () => {
      const caller = {
        id: 'caller-uuid',
        username: 'caller',
        preferredLanguage: 'en',
      };
      const callee = {
        id: 'callee-uuid',
        username: 'callee',
        preferredLanguage: 'fr',
      };
      const call = {
        id: 'call-uuid',
        callerId: 'caller-uuid',
        calleeId: 'callee-uuid',
        status: CallStatus.ACTIVE,
      };

      mockUserService.findOne.mockResolvedValueOnce(callee);
      mockUserService.findOne.mockResolvedValueOnce(caller);
      mockCallRepository.findOne.mockResolvedValue(null);
      mockCallRepository.create.mockReturnValue(call);
      mockCallRepository.save.mockResolvedValue(call);

      const result = await service.InitiateCall('caller-uuid', initiateCallDto);

      expect(result).toEqual(call);
      expect(mockCallRepository.create).toHaveBeenCalled();
    });

    it('should throw BadRequestException if calling self', async () => {
      const dto = { calleeId: 'same-uuid' };

      await expect(service.InitiateCall('same-uuid', dto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw NotFoundException if callee not found', async () => {
      mockUserService.findOne.mockResolvedValue(null);

      await expect(
        service.InitiateCall('caller-uuid', initiateCallDto),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ConflictException if already has active call', async () => {
      const caller = { id: 'caller-uuid', preferredLanguage: 'en' };
      const callee = { id: 'callee-uuid', preferredLanguage: 'fr' };
      const activeCall = { id: 'existing-call', status: CallStatus.ACTIVE };

      mockUserService.findOne.mockResolvedValueOnce(callee);
      mockUserService.findOne.mockResolvedValueOnce(caller);
      mockCallRepository.findOne.mockResolvedValue(activeCall);

      await expect(
        service.InitiateCall('caller-uuid', initiateCallDto),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('endCall', () => {
    it('should successfully end a call', async () => {
      const call = {
        id: 'call-uuid',
        callerId: 'caller-uuid',
        calleeId: 'callee-uuid',
        status: CallStatus.ACTIVE,
        startTime: new Date(Date.now() - 300000),
      };

      mockCallRepository.findOne.mockResolvedValue(call);
      mockCallRepository.save.mockResolvedValue({
        ...call,
        status: CallStatus.ENDED,
        durationSeconds: 300,
      });

      const result = await service.endCall('call-uuid', 'caller-uuid');

      expect(result.status).toBe(CallStatus.ENDED);
      expect(result.durationSeconds).toBeGreaterThan(0);
    });

    it('should throw NotFoundException if call not found', async () => {
      mockCallRepository.findOne.mockResolvedValue(null);

      await expect(
        service.endCall('invalid-uuid', 'user-uuid'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if user not part of call', async () => {
      const call = {
        id: 'call-uuid',
        callerId: 'caller-uuid',
        calleeId: 'callee-uuid',
        status: CallStatus.ACTIVE,
      };

      mockCallRepository.findOne.mockResolvedValue(call);

      await expect(
        service.endCall('call-uuid', 'stranger-uuid'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if call not active', async () => {
      const call = {
        id: 'call-uuid',
        callerId: 'caller-uuid',
        status: CallStatus.ENDED,
      };

      mockCallRepository.findOne.mockResolvedValue(call);

      await expect(service.endCall('call-uuid', 'caller-uuid')).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('GetCallHistory', () => {
    it('should return paginated call history', async () => {
      const calls = [
        { id: 'call-1', status: CallStatus.ENDED },
        { id: 'call-2', status: CallStatus.ENDED },
      ];

      mockCallRepository.findAndCount.mockResolvedValue([calls, 2]);

      const result = await service.GetCallHistory('user-uuid', 1, 10);

      expect(result.calls).toEqual(calls);
      expect(result.total).toBe(2);
      expect(result.page).toBe(1);
      expect(result.totalPages).toBe(1);
    });
  });

  describe('GetActiveCalls', () => {
    it('should return active call if exists', async () => {
      const call = { id: 'call-uuid', status: CallStatus.ACTIVE };
      mockCallRepository.findOne.mockResolvedValue(call);

      const result = await service.GetActiveCalls('user-uuid');

      expect(result).toEqual(call);
    });

    it('should return null if no active call', async () => {
      mockCallRepository.findOne.mockResolvedValue(null);

      const result = await service.GetActiveCalls('user-uuid');

      expect(result).toBeNull();
    });
  });

  describe('CreateCallLog', () => {
    it('should create a call log entry', async () => {
      const call = {
        id: 'call-uuid',
        callerId: 'speaker-uuid',
        calleeId: 'other-uuid',
      };
      const log = {
        id: 'log-uuid',
        callId: 'call-uuid',
        originalText: 'Hello',
        translatedText: 'Bonjour',
      };

      mockCallRepository.findOne.mockResolvedValue(call);
      mockCallLogRepository.create.mockReturnValue(log);
      mockCallLogRepository.save.mockResolvedValue(log);

      const result = await service.CreateCallLog(
        'call-uuid',
        'speaker-uuid',
        'Hello',
        'Bonjour',
        'en',
        'fr',
      );

      expect(result).toEqual(log);
    });

    it('should throw NotFoundException if call not found', async () => {
      mockCallRepository.findOne.mockResolvedValue(null);

      await expect(
        service.CreateCallLog(
          'invalid-uuid',
          'user',
          'text',
          'text',
          'en',
          'fr',
        ),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('GetCallLog', () => {
    it('should return call logs for a call', async () => {
      const call = {
        id: 'call-uuid',
        callerId: 'user-uuid',
      };
      const logs = [
        { id: 'log-1', originalText: 'Hello' },
        { id: 'log-2', originalText: 'Hi' },
      ];

      mockCallRepository.findOne.mockResolvedValue(call);
      mockCallLogRepository.find.mockResolvedValue(logs);

      const result = await service.GetCallLog('call-uuid', 'user-uuid');

      expect(result).toEqual(logs);
    });
  });
});
