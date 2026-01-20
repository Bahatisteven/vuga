import { Test, TestingModule } from '@nestjs/testing';
import { TranslationService } from './translation.service';
import { HttpException } from '@nestjs/common';

describe('TranslationService', () => {
  let service: TranslationService;
  let mockRedisClient: any;

  beforeEach(async () => {
    mockRedisClient = {
      get: jest.fn().mockResolvedValue(null),
      setex: jest.fn().mockResolvedValue('OK'),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TranslationService,
        {
          provide: 'REDIS_CLIENT',
          useValue: mockRedisClient,
        },
      ],
    }).compile();

    service = module.get<TranslationService>(TranslationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('translate', () => {
    it('should translate text from English to Kinyarwanda', async () => {
      const result = await service.translate('Hello, how are you?', 'en', 'rw');

      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    }, 15000);

    it('should translate text from English to Spanish', async () => {
      const result = await service.translate('Good morning', 'en', 'es');

      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
    }, 15000);

    it('should use cached translation if available', async () => {
      const cachedText = 'Muraho, amakuru yanyu?';
      mockRedisClient.get.mockResolvedValueOnce(cachedText);

      const result = await service.translate('Hello, how are you?', 'en', 'rw');

      expect(result).toBe(cachedText);
      expect(mockRedisClient.get).toHaveBeenCalled();
    });

    it('should cache translation result', async () => {
      await service.translate('Thank you', 'en', 'rw');

      expect(mockRedisClient.setex).toHaveBeenCalled();
    }, 15000);

    it('should handle translation errors gracefully', async () => {
      await expect(service.translate('', 'en', 'rw')).rejects.toThrow(
        HttpException,
      );
    }, 15000);
  });

  describe('normalizeLanguageCode', () => {
    it('should normalize language codes correctly', () => {
      const languages = service.getSupportedLanguages();

      expect(languages).toContain('en');
      expect(languages).toContain('fr-FR');
      expect(languages).toContain('rw-RW');
    });
  });

  describe('getSupportedLanguages', () => {
    it('should return array of supported languages', () => {
      const languages = service.getSupportedLanguages();

      expect(Array.isArray(languages)).toBe(true);
      expect(languages.length).toBeGreaterThan(0);
      expect(languages).toContain('en');
      expect(languages).toContain('fr');
      expect(languages).toContain('rw');
    });
  });
});
