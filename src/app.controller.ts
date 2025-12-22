import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

/**
 * handle base routes and health checks welcome message
 */

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getWelcome(): string {
    return this.appService.getWelcome();
  }

  @Get('health')
  getHealth(): object {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'Vuga Platform API'
    };
  }
}
