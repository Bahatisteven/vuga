import { Test, TestingModule } from '@nestjs/testing';
import { SpeechService } from './speech.service';

describe('SpeechService', () => {
  let service: SpeechService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SpeechService],
    }).compile();

    service = module.get<SpeechService>(SpeechService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getSupportedLanguages', () => {
    it('should return array of supported languages', () => {
      const languages = service.getSupportedLanguages();

      expect(Array.isArray(languages)).toBe(true);
      expect(languages.length).toBeGreaterThan(0);
      expect(languages).toContain('en-US');
      expect(languages).toContain('fr-FR');
      expect(languages).toContain('rw-RW');
    });
  });

  describe('getSpeechConfig', () => {
    it('should return speech configuration', () => {
      const config = service.getSpeechConfig();

      expect(config).toHaveProperty('stt');
      expect(config).toHaveProperty('tts');
      expect(config.stt).toHaveProperty('continuous');
      expect(config.tts).toHaveProperty('pitch');
    });

    it('should have valid STT config', () => {
      const config = service.getSpeechConfig();

      expect(config.stt.continuous).toBe(true);
      expect(config.stt.interimResults).toBe(true);
      expect(config.stt.maxAlternatives).toBe(1);
    });

    it('should have valid TTS config', () => {
      const config = service.getSpeechConfig();

      expect(config.tts.pitch).toBe(1);
      expect(config.tts.rate).toBe(1);
      expect(config.tts.volume).toBe(1);
    });
  });

  describe('getVoicesByLanguage', () => {
    it('should return voices for English', () => {
      const voices = service.getVoicesByLanguage('en-US');

      expect(Array.isArray(voices)).toBe(true);
      expect(voices.length).toBeGreaterThan(0);
    });

    it('should return voices for French', () => {
      const voices = service.getVoicesByLanguage('fr-FR');

      expect(Array.isArray(voices)).toBe(true);
      expect(voices.length).toBeGreaterThan(0);
    });

    it('should return default voice for unsupported language', () => {
      const voices = service.getVoicesByLanguage('unsupported');

      expect(voices).toEqual(['Default']);
    });
  });

  describe('validateLanguage', () => {
    it('should validate supported language', () => {
      expect(service.validateLanguage('en-US')).toBe(true);
      expect(service.validateLanguage('fr-FR')).toBe(true);
      expect(service.validateLanguage('rw-RW')).toBe(true);
    });

    it('should reject unsupported language', () => {
      expect(service.validateLanguage('unsupported')).toBe(false);
      expect(service.validateLanguage('en')).toBe(false);
    });
  });
});
