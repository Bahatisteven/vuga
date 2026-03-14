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
import { UseGuards } from '@nestjs/common';
import { JoinCallDto, TranscriptionDto } from './dto';
import { TranslationService } from '../translation/translation.service';
import { CallService } from '../call/call.service';
import { WebsocketService } from './websocket.service';
import { timestamp } from 'rxjs';

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
  private userLanguages: Map<string, Set<string>> = new Map();

  constructor(
    private translationService: TranslationService,
    private callService: CallService,
    private readonly websocketService: WebsocketService,
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
      await this.callService.findOne(callId);
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
    this.callRooms.get(callId).add(client.id);

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

    cansole.log(
      `Client ${client.id} joined call ${callId} with language ${language}`,
    );
  }
}
