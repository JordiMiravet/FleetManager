import { Controller, Post, UseGuards } from '@nestjs/common';
import type { AuthenticatedUser } from './authenticated-request';
import { CurrentUser } from './current-user.decorator';
import { FirebaseAuthGuard } from './firebase-auth.guard';

@Controller('auth')
export class AuthController {
  @Post('verify')
  @UseGuards(FirebaseAuthGuard)
  verifyToken(@CurrentUser() user: AuthenticatedUser) {
    return { message: 'User verified', user };
  }
}
