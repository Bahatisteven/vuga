import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WebsocketService } from './websocket.service';
import { WebsocketGateway } from './websocket.gateway';
import { TranslationModule } from '../translation/translation.module';
import { CallModule } from '../call/call.module';
import { Call } from '../call/entities';

@Module({
  imports: [
    TypeOrmModule.forFeature([Call]),
    TranslationModule,
    CallModule,
  ],
  providers: [WebsocketGateway, WebsocketService],
})
export class WebsocketModule {}
