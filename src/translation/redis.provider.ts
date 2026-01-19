import { Provider } from '@nestjs/common';
import Redis from 'ioredis';

export const RedisProvider: Provider = {
  provide: 'REDIS_CLIENT',
  useFactory: () => {
    let retryCount = 0;
    const maxRetries = 3;

    const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
      maxRetriesPerRequest: 3,
      retryStrategy: (times) => {
        retryCount++;
        if (retryCount > maxRetries) {
          console.error('Redis: Max retries reached.quitting..');
          return null;
        }
        const delay = Math.min(times * 1000, 3000);
        console.log(
          `Redis: Retry ${retryCount}/${maxRetries} in ${delay}ms...`,
        );
        return delay;
      },
      enableOfflineQueue: false,
      connectTimeout: 10000,
    });

    redis.on('ready', () => {
      console.log('Redis: Connected successfully');
      retryCount = 0;
    });

    redis.on('error', (err) => {
      console.error('Redis: Error -', err.message);
    });

    return redis;
  },
};
