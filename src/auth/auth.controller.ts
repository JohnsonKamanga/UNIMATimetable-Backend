import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from 'src/user/create-user.dto';

@Controller('auth')
export class AuthController {
  constructor(private authServices: AuthService) {}

  @Post('signin')
  signIn(@Body('username') username: string, @Body('password') password: string) {
    return this.authServices.signIn(username, password);
  }

  @Post('signup')
  signUp(@Body() user: CreateUserDto) {
    return this.authServices.signUp(user);
  }
}
