import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { SpeechService } from './speech.service';
import { TextToSpeechDto, SpeechResponseDto } from './dto';

@ApiTags('speech')
@Controller('speech')
export class SpeechController {
  constructor(private readonly speechService: SpeechService) {}

  @Get('languages')
  getSupportedLanguages(): { languages: string[] } {
    return {
      languages: this.speechService.getSupportedLanguages(),
    };
  }

  @Get('config')
  getSpeechConfig() {
    return this.speechService.getSpeechConfig();
  }

  @Get('voices/:language')
  getVoicesByLanguage(@Param('language') language: string) {
    return {
      language,
      voices: this.speechService.getVoicesByLanguage(language),
    };
  }

  @Post('validate')
  validateText(@Body() dto: TextToSpeechDto): SpeechResponseDto {
    const isValid = this.speechService.validateLanguage(dto.language);

    return {
      success: isValid,
      message: isValid
        ? 'Text is valid for speech synthesis'
        : 'Unsupported language',
      data: {
        text: dto.text,
        language: dto.language,
      },
    };
  }
}
