import {
  Controller,
  Post,
  Get,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import { CallService } from './call.service';
import { InitiateCallDto, EndCallDto } from './dto';
import { JwtAuthGuard } from '../auth/guards';
import { CurrentUser } from '../common/decorators';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('calls')
@ApiBearerAuth()
@Controller('calls')
@UseGuards(JwtAuthGuard)
export class CallController {
  constructor(private readonly callService: CallService) {}

  @Post('initiate')
  @HttpCode(HttpStatus.CREATED)
  async initiateCall(
    @CurrentUser('id') userId: string,
    @Body() initiateCallDto: InitiateCallDto,
  ) {
    return await this.callService.InitiateCall(userId, initiateCallDto);
  }

  @Patch(':callId/end')
  @HttpCode(HttpStatus.OK)
  async endCall(
    @Param('callId') callId: string,
    @CurrentUser('id') userId: string,
    @Body() endCallDto?: EndCallDto,
  ) {
    return await this.callService.endCall(callId, userId, endCallDto);
  }

  @Get('history')
  async getHistory(
    @CurrentUser('id') userId: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    return this.callService.GetCallHistory(userId, page, limit);
  }

  @Get('active')
  async getActiveCall(@CurrentUser('id') userId: string) {
    const call = await this.callService.GetActiveCalls(userId);
    if (!call) {
      return { message: 'No active call', call: null };
    }
    return call;
  }

  @Get(':callId')
  async getCallById(
    @Param('callId') callId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.callService.GetCallById(callId, userId);
  }

  @Get(':callId/logs')
  async getCallLogs(
    @Param('callId') callId: string,
    @CurrentUser('id') userId: string,
  ) {
    return await this.callService.GetCallLog(callId, userId);
  }
}
