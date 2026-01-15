import { Module } from '@nestjs/common';
import { TranslationService } from './translation.service';
import { TranslationController } from './translation.controller';
import { RedisProvider } from './redis.provider';

@Module({
  providers: [TranslationService, RedisProvider],
  controllers: [TranslationController],
  exports: [TranslationService],
})
export class TranslationModule {}
