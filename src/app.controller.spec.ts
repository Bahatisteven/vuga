import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('initializer', () => {
    it('should be defined', () => {
      expect(appController).toBeDefined();
    });
  });

  describe('root', () => {
    it('should return "Welcome to Vuga Platform API - Real-time Voice Translator"', () => {
      expect(appController.getWelcome()).toBe(
        'Welcome to Vuga Platform API - Real-time Voice Translator',
      );
    });
  });

  describe('health', () => {
    it('should return health status', () => {
      const result = appController.getHealth() as any;
      expect(result.status).toBe('ok');
      expect(result.service).toBe('Vuga Platform API');
      expect(result.timestamp).toBeDefined();
    });
  });
});
