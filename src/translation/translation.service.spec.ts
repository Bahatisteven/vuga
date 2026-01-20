import { Test, TestingModule } from '@nestjs/testing';
import { TranslationService } from './translation.service';
import { HttpException } from '@nestjs/common';
import axios from 'axios';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

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

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('translate', () => {
    it('should translate text from English to Kinyarwanda', async () => {
      const mockResponse = {
        data: {
          responseStatus: 200,
          responseData: {
            translatedText: 'Muraho, amakuru?',
          },
        },
      };

      mockedAxios.get.mockResolvedValue(mockResponse);

      const result = await service.translate('Hello, how are you?', 'en', 'rw');

      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
      expect(result).toBe('Muraho, amakuru?');
    });

    it('should translate text from English to Spanish', async () => {
      const mockResponse = {
        data: {
          responseStatus: 200,
          responseData: {
            translatedText: 'Buenos días',
          },
        },
      };

      mockedAxios.get.mockResolvedValue(mockResponse);

      const result = await service.translate('Good morning', 'en', 'es');

      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
      expect(result).toBe('Buenos días');
    });

    it('should use cached translation if available', async () => {
      const cachedText = 'Muraho, amakuru yanyu?';
      mockRedisClient.get.mockResolvedValueOnce(cachedText);

      const result = await service.translate('Hello, how are you?', 'en', 'rw');

      expect(result).toBe(cachedText);
      expect(mockRedisClient.get).toHaveBeenCalled();
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(mockedAxios.get).not.toHaveBeenCalled();
    });

    it('should cache translation result', async () => {
      const mockResponse = {
        data: {
          responseStatus: 200,
          responseData: {
            translatedText: 'Murakoze',
          },
        },
      };

      mockedAxios.get.mockResolvedValue(mockResponse);

      await service.translate('Thank you', 'en', 'rw');

      expect(mockRedisClient.setex).toHaveBeenCalledWith(
        'translation:en:rw:Thank you',
        604800,
        'Murakoze',
      );
    });

    it('should handle translation errors gracefully', async () => {
      const mockError = {
        data: {
          responseStatus: 403,
          responseDetails: 'INVALID REQUEST',
        },
      };

      mockedAxios.get.mockResolvedValue(mockError);

      await expect(service.translate('', 'en', 'rw')).rejects.toThrow(
        HttpException,
      );
    });
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
