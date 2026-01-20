import { Test, TestingModule } from '@nestjs/testing';
import { TranslationController } from './translation.controller';
import { TranslationService } from './translation.service';
import { TranslateDto } from './dto';

jest.mock('../auth/guards', () => ({
  JwtAuthGuard: jest.fn().mockImplementation(() => ({
    canActivate: jest.fn(() => true),
  })),
}));

describe('TranslationController', () => {
  let controller: TranslationController;

  const mockTranslationService = {
    translate: jest.fn(),
    getSupportedLanguages: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TranslationController],
      providers: [
        {
          provide: TranslationService,
          useValue: mockTranslationService,
        },
      ],
    }).compile();

    controller = module.get<TranslationController>(TranslationController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('translate', () => {
    it('should translate text successfully', async () => {
      const dto: TranslateDto = {
        text: 'Hello, how are you?',
        sourceLang: 'en',
        targetLang: 'fr',
      };

      const translatedText = 'Bonjour, comment allez-vous?';
      mockTranslationService.translate.mockResolvedValue(translatedText);

      const result = await controller.translate(dto);

      expect(mockTranslationService.translate).toHaveBeenCalledWith(
        dto.text,
        dto.sourceLang,
        dto.targetLang,
      );
      expect(result).toEqual({
        originalText: dto.text,
        translatedText: translatedText,
        sourceLang: dto.sourceLang,
        targetLang: dto.targetLang,
        cached: false,
      });
    });

    it('should translate from English to Spanish', async () => {
      const dto: TranslateDto = {
        text: 'Good morning',
        sourceLang: 'en',
        targetLang: 'es',
      };

      const translatedText = 'Buenos días';
      mockTranslationService.translate.mockResolvedValue(translatedText);

      const result = await controller.translate(dto);

      expect(mockTranslationService.translate).toHaveBeenCalledWith(
        dto.text,
        dto.sourceLang,
        dto.targetLang,
      );
      expect(result.translatedText).toBe(translatedText);
      expect(result.originalText).toBe(dto.text);
    });

    it('should translate from English to Kinyarwanda', async () => {
      const dto: TranslateDto = {
        text: 'Thank you',
        sourceLang: 'en',
        targetLang: 'rw',
      };

      const translatedText = 'Murakoze';
      mockTranslationService.translate.mockResolvedValue(translatedText);

      const result = await controller.translate(dto);

      expect(mockTranslationService.translate).toHaveBeenCalledWith(
        dto.text,
        dto.sourceLang,
        dto.targetLang,
      );
      expect(result.translatedText).toBe(translatedText);
    });

    it('should handle service errors', async () => {
      const dto: TranslateDto = {
        text: 'Hello',
        sourceLang: 'en',
        targetLang: 'fr',
      };

      mockTranslationService.translate.mockRejectedValue(
        new Error('Translation service unavailable'),
      );

      await expect(controller.translate(dto)).rejects.toThrow();
    });
  });

  describe('getSupportedLanguages', () => {
    it('should return list of supported languages', () => {
      const languages = [
        'en',
        'en-US',
        'fr',
        'fr-FR',
        'es',
        'es-ES',
        'rw',
        'rw-RW',
      ];
      mockTranslationService.getSupportedLanguages.mockReturnValue(languages);

      const result = controller.getSupportedLanguages();

      expect(mockTranslationService.getSupportedLanguages).toHaveBeenCalled();
      expect(result).toEqual({ languages });
      expect(Array.isArray(result.languages)).toBe(true);
    });

    it('should include all required languages', () => {
      const languages = [
        'en',
        'en-US',
        'fr',
        'fr-FR',
        'es',
        'es-ES',
        'rw',
        'rw-RW',
      ];
      mockTranslationService.getSupportedLanguages.mockReturnValue(languages);

      const result = controller.getSupportedLanguages();

      expect(result.languages).toContain('en');
      expect(result.languages).toContain('fr');
      expect(result.languages).toContain('rw');
      expect(result.languages.length).toBeGreaterThan(0);
    });
  });
});
