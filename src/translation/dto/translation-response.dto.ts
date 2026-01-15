import { ApiProperty } from '@nestjs/swagger';

export class TranslationResponseDto {
  @ApiProperty({ description: 'Original text' })
  originalText: string;

  @ApiProperty({ description: 'Translated text' })
  translatedText: string;

  @ApiProperty({ description: 'Source language' })
  sourceLang: string;

  @ApiProperty({ description: 'Target language' })
  targetLang: string;

  @ApiProperty({ description: 'Whether result was cached' })
  cached: boolean;
}
