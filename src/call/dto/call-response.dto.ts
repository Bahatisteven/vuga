import { CallStatus } from '../entities';

export class CallResponseDto {
  id: string;
  caller: {
    id: string;
    username: string;
    email: string;
  };
  callee: {
    id: string;
    username: string;
    email: string;
  };

  startTime: Date;
  endTime: Date | null;
  durationSeconds: number | null;
  callerLanguage: string;
  calleeLanguage: string;
  status: CallStatus;
  createdAt: Date;
}
