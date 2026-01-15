import { IsString, IsNotEmpty, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class TranslateDto {
  @ApiProperty({
    description: 'Text to translate',
    example: 'Hello, how are you?',
  })
  @IsString()
  @IsNotEmpty()
  @Length(1, 5000)
  text: string;

  @ApiProperty({
    description: 'Source language code',
    example: 'en-US',
  })
  @IsString()
  @IsNotEmpty()
  sourceLang: string;

  @ApiProperty({
    description: 'Target language code',
    example: 'fr-FR',
  })
  @IsString()
  @IsNotEmpty()
  targetLang: string;
}
