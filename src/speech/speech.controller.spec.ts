import { Test, TestingModule } from '@nestjs/testing';
import { SpeechController } from './speech.controller';
import { SpeechService } from './speech.service';
import { TextToSpeechDto } from './dto';

describe('SpeechController', () => {
  let controller: SpeechController;

  const mockSpeechService = {
    getSupportedLanguages: jest.fn(),
    getSpeechConfig: jest.fn(),
    getVoicesByLanguage: jest.fn(),
    validateLanguage: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SpeechController],
      providers: [
        {
          provide: SpeechService,
          useValue: mockSpeechService,
        },
      ],
    }).compile();

    controller = module.get<SpeechController>(SpeechController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getSupportedLanguages', () => {
    it('should return list of supported languages', () => {
      const languages = ['en-US', 'fr-FR', 'rw-RW'];
      mockSpeechService.getSupportedLanguages.mockReturnValue(languages);

      const result = controller.getSupportedLanguages();

      expect(mockSpeechService.getSupportedLanguages).toHaveBeenCalled();
      expect(result).toEqual({ languages });
    });
  });

  describe('getSpeechConfig', () => {
    it('should return speech configuration', () => {
      const config = {
        stt: { continuous: true, interimResults: true },
        tts: { pitch: 1, rate: 1, volume: 1 },
      };
      mockSpeechService.getSpeechConfig.mockReturnValue(config);

      const result = controller.getSpeechConfig();

      expect(mockSpeechService.getSpeechConfig).toHaveBeenCalled();
      expect(result).toEqual(config);
    });
  });

  describe('getVoicesByLanguage', () => {
    it('should return voices for specified language', () => {
      const voices = ['Google US English', 'Microsoft David'];
      mockSpeechService.getVoicesByLanguage.mockReturnValue(voices);

      const result = controller.getVoicesByLanguage('en-US');

      expect(mockSpeechService.getVoicesByLanguage).toHaveBeenCalledWith(
        'en-US',
      );
      expect(result).toEqual({ language: 'en-US', voices });
    });
  });

  describe('validateText', () => {
    it('should validate text with supported language', () => {
      const dto: TextToSpeechDto = {
        text: 'Hello world',
        language: 'en-US',
      };
      mockSpeechService.validateLanguage.mockReturnValue(true);

      const result = controller.validateText(dto);

      expect(mockSpeechService.validateLanguage).toHaveBeenCalledWith('en-US');
      expect(result.success).toBe(true);
      expect(result.message).toContain('valid');
    });

    it('should reject text with unsupported language', () => {
      const dto: TextToSpeechDto = {
        text: 'Hello world',
        language: 'xx-XX' as any,
      };
      mockSpeechService.validateLanguage.mockReturnValue(false);

      const result = controller.validateText(dto);

      expect(mockSpeechService.validateLanguage).toHaveBeenCalledWith('xx-XX');
      expect(result.success).toBe(false);
      expect(result.message).toContain('Unsupported');
    });
  });
});
