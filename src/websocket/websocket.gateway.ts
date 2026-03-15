import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JoinCallDto, TranscriptionDto } from './dto';
import { TranslationService } from '../translation/translation.service';
import { CallService } from '../call/call.service';
import { WebsocketService } from './websocket.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Call } from '../call/entities';
@WebSocketGateway({
  cors: {
    origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000'],
    credentials: true,
  },
})
export class WebsocketGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  // which clients are in which rooms
  private callRooms: Map<string, Set<string>> = new Map();

  // language preferences
  private userLanguages: Map<string, string> = new Map();

  constructor(
    private translationService: TranslationService,
    private callService: CallService,
    private readonly websocketService: WebsocketService,
    @InjectRepository(Call)
    private callRepository: Repository<Call>,
  ) {}

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);

    this.callRooms.forEach((clients, callId) => {
      if (clients.has(client.id)) {
        clients.delete(client.id);

        // notify other user left
        this.server.to(callId).emit('user-left', {
          userId: client.id,
          timestamp: new Date(),
        });

        this.userLanguages.delete(client.id);
      }
    });
  }

  /** join call event */

  @SubscribeMessage('join-call')
  async handleJoinCall(
    @MessageBody() data: JoinCallDto,
    @ConnectedSocket() client: Socket,
  ) {
    const { callId, language } = data;

    try {
      // verify call exists
      const call = await this.callRepository.findOne({
        where: { id: callId },
      });
      if (!call) {
        throw new Error('Call not found');
      }
    } catch (error) {
      client.emit('error', { message: 'Call not found' });
      return;
    }

    // join socket.io room
    client.join(callId);

    // track user in room
    if (!this.callRooms.has(callId)) {
      this.callRooms.set(callId, new Set());
    }
    this.callRooms.get(callId)!.add(client.id);

    // store user language
    this.userLanguages.set(client.id, language);

    // notify other someone joined
    client.to(callId).emit('user-joined', {
      userId: client.id,
      language,
      timestamp: new Date(),
    });

    // send confirmation
    client.emit('joined-call', {
      callId,
      language,
      participants: this.callRooms.get(callId)?.size,
      timestamp: new Date(),
    });

    console.log(
      `Client ${client.id} joined call ${callId} with language ${language}`,
    );
  }

  /** handle leave call event */

  @SubscribeMessage('leave-call')
  handleLeaveCall(
    @MessageBody() data: { callId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const { callId } = data;

    //leave socket.io
    client.leave(callId);

    //remove from tacking
    const room = this.callRooms.get(callId);
    if (room) {
      room.delete(client.id);
      if (room.size === 0) {
        this.callRooms.delete(callId);
      }
    }

    //remove language tracking
    this.userLanguages.delete(client.id);

    //notify others
    client.to(callId).emit('user-left', {
      userId: client.id,
      timestamp: new Date(),
    });

    console.log(`Client ${client.id} left call ${callId}`);
  }

  /** transcription event */

  @SubscribeMessage('transcription')
  async handleTranscription(
    @MessageBody() data: TranscriptionDto,
    @ConnectedSocket() client: Socket,
  ) {
    const { callId, text, language } = data;

    // broadcast original transcription to all in rooms
    this.server.to(callId).emit('transcription', {
      userId: client.id,
      text,
      language,
      timestamp: new Date(),
    });

    // translate for each participants with diff language

    const room = this.callRooms.get(callId);
    if (room) {
      for (const participantId of room) {
        // skip sender
        if (participantId !== client.id) {
          const targetLanguage = this.userLanguages.get(participantId);

          //only translate if target lang is diff
          if (targetLanguage && targetLanguage !== language) {
            try {
              const translatedText = await this.translationService.translate(
                text,
                language,
                targetLanguage,
              );
              // send translated text to specific partcipant
              this.server.to(participantId).emit('translated-text', {
                originalText: text,
                translatedText: translatedText,
                sourceLanguage: language,
                targetLanguage,
                userId: client.id,
                timestamp: new Date(),
              });
            } catch (error) {
              console.error('Translation error:', error);

              //send error to participants
              this.server.to(participantId).emit('translation-error', {
                message: 'Translation failed',
                originalText: text,
              });
            }
          }
        }
      }
    }
  }

  /**handle ping event(for connection testing) */
  @SubscribeMessage('ping')
  handlePing(@ConnectedSocket() client: Socket) {
    client.emit('pong', { timestamp: new Date() });
  }
}
