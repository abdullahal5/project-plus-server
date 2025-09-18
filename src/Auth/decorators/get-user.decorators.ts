import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

export const GetUser = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    // Detect if it's GraphQL
    const gqlCtx = GqlExecutionContext.create(ctx);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const request = gqlCtx.getContext().req ?? ctx.switchToHttp().getRequest();

    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const user = request.user;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access
    return data ? user?.[data] : user;
  },
);
