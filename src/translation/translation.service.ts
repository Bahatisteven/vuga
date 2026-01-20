import {
  Injectable,
  Logger,
  HttpException,
  HttpStatus,
  Inject,
} from '@nestjs/common';
import axios from 'axios';
import { Redis } from 'ioredis';

@Injectable()
export class TranslationService {
  private readonly logger = new Logger(TranslationService.name);
  private readonly myMemoryApiUrl = 'https://api.mymemory.translated.net/get';

  constructor(
    @Inject('REDIS_CLIENT')
    private readonly redisClient: Redis,
  ) {}

  async translate(
    text: string,
    sourceLang: string,
    targetLang: string,
  ): Promise<string> {
    // check cache
    const cached = await this.getCachedTranslation(
      text,
      sourceLang,
      targetLang,
    );
    if (cached) {
      this.logger.log(`Cache hit: ${text.substring(0, 50)}...`);
      return cached;
    }

    try {
      const normalizedSource = this.normalizeLanguageCode(sourceLang);
      const normalizedTarget = this.normalizeLanguageCode(targetLang);
      const langPair = `${normalizedSource}|${normalizedTarget}`;

      const response = await axios.get(this.myMemoryApiUrl, {
        params: {
          q: text,
          langpair: langPair,
        },
        timeout: 10000,
      });

      if (response.data.responseStatus !== 200) {
        throw new Error(response.data.responseDetails || 'Translation failed');
      }

      const translatedText: string = response.data.responseData.translatedText;

      await this.cacheTranslation(text, sourceLang, targetLang, translatedText);

      this.logger.log(
        `Translated (${sourceLang} → ${targetLang}): "${text.substring(0, 30)}..." → "${translatedText.substring(0, 30)}..."`,
      );
      return translatedText;
    } catch (error) {
      this.logger.error(
        `Translation error: ${error.message || error.response?.data}`,
      );
      throw new HttpException(
        'Translation Service unavailable',
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
  }

  private normalizeLanguageCode(langCode: string): string {
    const langMap: Record<string, string> = {
      en: 'en',
      'en-us': 'en',
      'en-gb': 'en',
      fr: 'fr',
      'fr-fr': 'fr',
      es: 'es',
      'es-es': 'es',
      rw: 'rw',
      'rw-rw': 'rw',
      de: 'de',
      'de-de': 'de',
      it: 'it',
      'it-it': 'it',
      pt: 'pt',
      'pt-br': 'pt',
      ar: 'ar',
      'ar-sa': 'ar',
      zh: 'zh',
      'zh-cn': 'zh-CN',
      ja: 'ja',
      'ja-jp': 'ja',
    };

    const normalized = langCode.toLowerCase();
    return langMap[normalized] || 'en';
  }

  private async getCachedTranslation(
    text: string,
    sourceLang: string,
    targetLang: string,
  ): Promise<string | null> {
    try {
      const cacheKey = `translation:${sourceLang}:${targetLang}:${text}`;
      const cached = await this.redisClient.get(cacheKey);
      return cached;
    } catch (error) {
      this.logger.warn(`Cache read error: ${error.message}`);
      return null;
    }
  }

  private async cacheTranslation(
    sourceText: string,
    sourceLang: string,
    targetLang: string,
    translatedText: string,
  ): Promise<void> {
    try {
      const cacheKey = `translation:${sourceLang}:${targetLang}:${sourceText}`;
      const ttl = 60 * 60 * 24 * 7;

      await this.redisClient.setex(cacheKey, ttl, translatedText);
    } catch (error) {
      this.logger.warn(`Cache write error: ${error.message}`);
    }
  }

  getSupportedLanguages(): string[] {
    return [
      'en',
      'en-US',
      'fr',
      'fr-FR',
      'es',
      'es-ES',
      'rw',
      'rw-RW',
      'de',
      'de-DE',
      'it',
      'it-IT',
      'pt',
      'pt-BR',
      'ar',
      'ar-SA',
      'zh',
      'zh-CN',
      'ja',
      'ja-JP',
    ];
  }
}
