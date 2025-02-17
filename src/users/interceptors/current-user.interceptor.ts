import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { UsersService } from '../users.service';

@Injectable()
export class CurrentUserInterceptor implements NestInterceptor {
  constructor(private _userService: UsersService) {}

  async intercept(context: ExecutionContext, handler: CallHandler) {
    const request = context.switchToHttp().getRequest();
    const { userId } = request.session || {};

    if (!userId) {
      return handler.handle();
    }

    const user = await this._userService.findOne(userId);
    if (!user) {
      throw new Error('User not found');
    }

    request.currentUser = user;
    // context.switchToHttp().getRequest().user = user;

    return handler.handle();
  }
}
