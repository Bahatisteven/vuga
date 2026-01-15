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
  private readonly apiUrl =
    process.env.LIBRETRANSLATE_URL || 'https://libretranslate.com/translate';

  constructor(
    @Inject('REDIS_CLIENT')
    private readonly redisClient: Redis,
  ) {}

  async translate(
    text: string,
    sourceLang: string,
    targetLang: string,
  ): Promise<string> {
    // checking cache
    const cached = await this.getCachedTranslation(
      text,
      sourceLang,
      targetLang,
    );
    if (cached) {
      this.logger.warn(`Cache hit: ${text.substring(0, 50)}...`);
      return cached;
    }

    // libreTranslate api
    try {
      const response = await axios.post(
        this.apiUrl,
        {
          q: text,
          source: this.normalizeLanguageCode(sourceLang),
          target: this.normalizeLanguageCode(targetLang),
          format: 'text',
          api_key: process.env.LIBRETRANSLATE_API_KEY || '',
        },
        {
          headers: { 'Content-Type': 'application/json' },
          timeout: 5000,
        },
      );

      const translatedText = response.data.translatedText as string;

      // cache result
      await this.cacheTranslation(text, sourceLang, targetLang, translatedText);

      this.logger.log(
        `Translated: "${text.substring(0, 30)}..." -> "${translatedText.substring(0, 30)}..."`,
      );
      return translatedText;
    } catch (error) {
      this.logger.error(`Translation error: ${error.message}`);
      throw new HttpException(
        'Translation Service unavailable',
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
  }

  private normalizeLanguageCode(langCode: string): string {
    return langCode.split('-')[0].toLowerCase();
  }

  /** get cached translation from redis */
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

  /** cache translation result */
  private async cacheTranslation(
    sourceText: string,
    sourceLang: string,
    targetLang: string,
    translatedText: string,
  ): Promise<void> {
    try {
      const cacheKey = `translation: ${sourceLang}: ${targetLang}: ${sourceText}`;
      const ttl = 60 * 60 * 24 * 7;

      await this.redisClient.setex(cacheKey, ttl, translatedText);
    } catch (error) {
      this.logger.warn(`Cache write error: ${error.message}`);
    }
  }

  getSupportedLanguages(): string[] {
    return ['en', 'fr', 'es', 'de', 'it', 'pt', 'ru', 'ar', 'zh', 'ja'];
  }
}
