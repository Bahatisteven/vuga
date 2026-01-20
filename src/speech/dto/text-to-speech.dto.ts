import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsIn } from 'class-validator';

export class TextToSpeechDto {
  @ApiProperty({
    description: 'Text to convert to speech',
    example: 'Hello, how are you?',
  })
  @IsString()
  @IsNotEmpty()
  text: string;

  @ApiProperty({
    description: 'Language code for speech synthesis',
    example: 'en-US',
  })
  @IsString()
  @IsNotEmpty()
  @IsIn([
    'en-US',
    'en-GB',
    'fr-FR',
    'es-ES',
    'rw-RW',
    'de-DE',
    'it-IT',
    'pt-BR',
    'ar-SA',
    'zh-CN',
    'ja-JP',
  ])
  language: string;
}
