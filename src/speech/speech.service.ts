import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class SpeechService {
  private readonly logger = new Logger(SpeechService.name);

  getSupportedLanguages(): string[] {
    return [
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
    ];
  }

  getSpeechConfig() {
    return {
      stt: {
        continuous: true,
        interimResults: true,
        maxAlternatives: 1,
      },
      tts: {
        pitch: 1,
        rate: 1,
        volume: 1,
      },
    };
  }

  getVoicesByLanguage(language: string) {
    const voiceMap: Record<string, string[]> = {
      'en-US': [
        'Google US English',
        'Microsoft David',
        'Microsoft Zira',
        'Alex',
      ],
      'en-GB': ['Google UK English Female', 'Google UK English Male'],
      'fr-FR': ['Google français', 'Thomas', 'Amelie'],
      'es-ES': ['Google español', 'Monica', 'Jorge'],
      'rw-RW': ['Default'],
      'de-DE': ['Google Deutsch', 'Anna', 'Stefan'],
      'it-IT': ['Google italiano', 'Alice', 'Luca'],
      'pt-BR': ['Google português do Brasil', 'Luciana'],
      'ar-SA': ['Google العربية', 'Maged'],
      'zh-CN': ['Google 普通话（中国大陆）', 'Ting-Ting'],
      'ja-JP': ['Google 日本語', 'Kyoko'],
    };

    return voiceMap[language] || ['Default'];
  }

  validateLanguage(language: string): boolean {
    return this.getSupportedLanguages().includes(language);
  }
}
