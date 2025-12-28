import { Injectable } from '@nestjs/common';

/**
 * application service
 */

@Injectable()
export class AppService {
  getWelcome(): string {
    return 'Welcome to Vuga Platform API - Real-time Voice Translator';
  }
}
