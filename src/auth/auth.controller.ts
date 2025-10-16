import { Body, Controller, Post, Res } from '@nestjs/common';
import type { Response } from 'express';
import { AuthService } from './auth.service';
import { LoginUserDto } from './dto/login-user-dto';
import { VerifyOtpDto } from './dto/verify-user-dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  async loginUser(@Body() body: LoginUserDto) {
    return this.authService.loginUser(body.email, body.password);
  }

  @Post('verify-otp')
  async verifyOtp(
    @Body() body: VerifyOtpDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.verifyOtpAndGenerateToken(
      body.email,
      body.code,
    );

    // Set HttpOnly cookie for refresh token
    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      sameSite: 'strict',
    });

    return {
      message: result.message,
      accessToken: result.accessToken,
    };
  }
}
