import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { SpeechService } from './speech.service';
import { TextToSpeechDto, SpeechResponseDto } from './dto';

@ApiTags('speech')
@Controller('speech')
export class SpeechController {
  constructor(private readonly speechService: SpeechService) {}

  @Get('languages')
  @ApiOperation({ summary: 'Get supported speech languages' })
  getSupportedLanguages(): { languages: string[] } {
    return {
      languages: this.speechService.getSupportedLanguages(),
    };
  }

  @Get('config')
  @ApiOperation({ summary: 'Get speech recognition and synthesis config' })
  getSpeechConfig() {
    return this.speechService.getSpeechConfig();
  }

  @Get('voices/:language')
  @ApiOperation({ summary: 'Get available voices for a language' })
  getVoicesByLanguage(@Param('language') language: string) {
    return {
      language,
      voices: this.speechService.getVoicesByLanguage(language),
    };
  }

  @Post('validate')
  @ApiOperation({ summary: 'Validate text for speech synthesis' })
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
