import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type {
  AuthenticatedRequest,
  AuthenticatedUser,
} from './authenticated-request';

export const CurrentUser: (
  field?: keyof AuthenticatedUser,
) => ParameterDecorator = createParamDecorator<
  keyof AuthenticatedUser | undefined,
  unknown
>((field, context: ExecutionContext) => {
  const user = context.switchToHttp().getRequest<AuthenticatedRequest>().user;

  return field ? user?.[field] : user;
});
