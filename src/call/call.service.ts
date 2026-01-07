import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Call, CallLog, CallStatus } from './entities';
import { InitiateCallDto } from './dto';
import { UserService } from '../../src/user/user.service';

@Injectable()
export class CallService {
  constructor(
    @InjectRepository(Call)
    private callRepository: Repository<Call>,
    @InjectRepository(CallLog)
    private callLogRepository: Repository<CallLog>,
    private userService: UserService,
  ) {}

  /**initiate call */

  async InitiateCall(
    callerId: string,
    initiateCallDto: InitiateCallDto,
  ): Promise<Call> {
    const { calleeId, callerLanguage } = initiateCallDto;

    if (callerId === calleeId) {
      throw new BadRequestException('You cannot call yourself');
    }

    const callee = await this.userService.findOne(calleeId);
    if (!callee) {
      throw new NotFoundException('Callee not found');
    }

    const caller = await this.userService.findOne(callerId);
    if (!caller) {
      throw new NotFoundException('Caller not found ');
    }

    const activeCall = await this.callRepository.findOne({
      where: [
        { callerId, status: CallStatus.ACTIVE },
        { calleeId: callerId, status: CallStatus.ACTIVE },
      ],
    });
    if (activeCall) {
      throw new ConflictException('You already have an active call');
    }

    // call record
    const call = this.callRepository.create({
      callerId,
      calleeId,
      callerLanguage: callerLanguage || caller.preferredLanguage,
      calleeLanguage: callee.preferredLanguage,
      status: CallStatus.ACTIVE,
    });

    return await this.callRepository.save(call);
  }

  /**end call  */

  async endCall(callId: string, userId: string): Promise<Call> {
    const call = await this.callRepository.findOne({
      where: { id: callId },
    });
    if (!call) {
      throw new NotFoundException('Call not found');
    }

    if (call.callerId !== userId && call.calleeId !== userId) {
      throw new BadRequestException('You are not part of this call');
    }

    if (call.status !== CallStatus.ACTIVE) {
      throw new BadRequestException('Call is not active ');
    }

    const endTime = new Date();
    const durationSeconds = Math.floor(
      (endTime.getTime() - call.startTime.getTime()) / 1000,
    );

    call.endTime = endTime;
    call.durationSeconds = durationSeconds;
    call.status = CallStatus.ENDED;

    return await this.callRepository.save(call);
  }

  /**get call history(paginated)*/
  async GetCallHistory(
    userId: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<{
    calls: Call[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const skip = (page - 1) * limit;

    const [calls, total] = await this.callRepository.findAndCount({
      where: [{ callerId: userId, calleeId: userId }],
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
    });

    return {
      calls,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**get active calls */
  async GetActiveCalls(userId: string): Promise<Call | null> {
    return await this.callRepository.findOne({
      where: [
        { callerId: userId, status: CallStatus.ACTIVE },
        { calleeId: userId, status: CallStatus.ACTIVE },
      ],
    });
  }

  async GetCallById(callId: string, userId: string): Promise<Call> {
    const call = await this.callRepository.findOne({
      where: [{ id: callId }],
    });

    if (!call) {
      throw new NotFoundException('Call not found');
    }

    if (call.callerId !== userId && call.calleeId !== userId) {
      throw new BadRequestException('You are not part of this call');
    }

    return call;
  }

  /**
   * call log
   * analytics
   */

  async CreateCallLog(
    callId: string,
    speakerId: string,
    originalText: string,
    translatedText: string,
    sourceLanguage: string,
    targetLanguage: string,
  ): Promise<CallLog> {
    const call = await this.callRepository.findOne({ where: [{ id: callId }] });
    if (!call) {
      throw new NotFoundException('Call not found');
    }

    if (call.callerId !== speakerId && call.calleeId !== speakerId) {
      throw new BadRequestException('You are not part of this call');
    }

    const log = this.callLogRepository.create({
      callId,
      speakerId,
      originalText,
      translatedText,
      sourceLanguage,
      targetLanguage,
    });

    return await this.callLogRepository.save(log);
  }

  /** call log for specific call */
  async GetCallLog(callId: string, userId: string): Promise<CallLog[]> {
    await this.GetCallById(callId, userId);

    return await this.callLogRepository.find({
      where: [{ id: callId }],
      order: { timestamp: 'ASC' },
    });
  }
}
