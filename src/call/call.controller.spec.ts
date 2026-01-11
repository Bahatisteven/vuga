import { Test, TestingModule } from '@nestjs/testing';
import { CallController } from './call.controller';
import { CallService } from './call.service';
import { CallStatus } from './entities/call.entity';

const mockCallService = {
  InitiateCall: jest.fn(),
  endCall: jest.fn(),
  GetCallHistory: jest.fn(),
  GetActiveCalls: jest.fn(),
  GetCallById: jest.fn(),
  GetCallLog: jest.fn(),
};

describe('CallController', () => {
  let controller: CallController;
  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [CallController],
      providers: [
        {
          provide: CallService,
          useValue: mockCallService,
        },
      ],
    }).compile();

    controller = module.get<CallController>(CallController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('initiateCall', () => {
    it('should initiate a new call', async () => {
      const initiateDto = { calleeId: 'callee-uuid' };
      const call = {
        id: 'call-uuid',
        status: CallStatus.ACTIVE,
      };

      mockCallService.InitiateCall.mockResolvedValue(call);

      const result = await controller.initiateCall('caller-uuid', initiateDto);

      expect(result).toEqual(call);
      expect(mockCallService.InitiateCall).toHaveBeenCalledWith(
        'caller-uuid',
        initiateDto,
      );
    });
  });

  describe('endCall', () => {
    it('should end a call', async () => {
      const endDto = { reason: 'completed' };
      const call = {
        id: 'call-uuid',
        status: CallStatus.ENDED,
        durationSeconds: 300,
      };

      mockCallService.endCall.mockResolvedValue(call);

      const result = await controller.endCall('call-uuid', 'user-uuid', endDto);

      expect(result).toEqual(call);
      expect(mockCallService.endCall).toHaveBeenCalledWith(
        'call-uuid',
        'user-uuid',
        endDto,
      );
    });
  });

  describe('getHistory', () => {
    it('should return paginated call history', async () => {
      const history = {
        calls: [],
        total: 0,
        page: 1,
        totalPages: 0,
      };

      mockCallService.GetCallHistory.mockResolvedValue(history);

      const result = await controller.getHistory('user-uuid', 1, 10);

      expect(result).toEqual(history);
    });
  });

  describe('getActiveCall', () => {
    it('should return active call if exists', async () => {
      const call = { id: 'call-uuid', status: CallStatus.ACTIVE };
      mockCallService.GetActiveCalls.mockResolvedValue(call);

      const result = await controller.getActiveCall('user-uuid');

      expect(result).toEqual(call);
    });

    it('should return message if no active call', async () => {
      mockCallService.GetActiveCalls.mockResolvedValue(null);

      const result = await controller.getActiveCall('user-uuid');

      expect(result).toEqual({ message: 'No active call', call: null });
    });
  });

  describe('getCallById', () => {
    it('should return call details', async () => {
      const call = { id: 'call-uuid', status: CallStatus.ENDED };
      mockCallService.GetCallById.mockResolvedValue(call);

      const result = await controller.getCallById('call-uuid', 'user-uuid');

      expect(result).toEqual(call);
    });
  });

  describe('getCallLogs', () => {
    it('should return call logs', async () => {
      const logs = [{ id: 'log-1', originalText: 'Hello' }];
      mockCallService.GetCallLog.mockResolvedValue(logs);

      const result = await controller.getCallLogs('call-uuid', 'user-uuid');

      expect(result).toEqual(logs);
    });
  });
});
