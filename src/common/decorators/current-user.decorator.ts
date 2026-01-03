import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * custom decorator to extract authenticated user from request
 */
export const CurrentUser = createParamDecorator(
  (
    data: string | undefined,
    ctx: ExecutionContext,
  ): string | Record<string, any> => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;

    if (data) {
      return user?.[data] as string;
    }

    return user as Record<string, any>;
  },
);
