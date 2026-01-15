import { Controller, Post, Get, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards';
import { TranslationService } from './translation.service';
import { TranslateDto, TranslationResponseDto } from './dto';

@ApiTags('Translation')
@ApiBearerAuth()
@Controller('Translation')
@UseGuards(JwtAuthGuard)
export class TranslationController {
  constructor(private readonly translationService: TranslationService) {}

  @Post('translate')
  async translate(@Body() dto: TranslateDto): Promise<TranslationResponseDto> {
    const translatedText = await this.translationService.translate(
      dto.text,
      dto.sourceLang,
      dto.targetLang,
    );

    return {
      originalText: dto.text,
      translatedText,
      sourceLang: dto.sourceLang,
      targetLang: dto.targetLang,
      cached: false,
    };
  }

  @Get('languages')
  getSupportedLanguages(): { languages: string[] } {
    return {
      languages: this.translationService.getSupportedLanguages(),
    };
  }
}
