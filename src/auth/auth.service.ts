import { BadRequestException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import bcrypt from 'bcrypt';
import { envConfig } from 'src/config';
import { PrismaService } from 'src/prisma/prisma.service';
import generateToken from 'src/utils/generateToken';
import { OtpService } from './otp.service';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private otpService: OtpService,
    private jwtService: JwtService,
  ) {}

  async loginUser(email: string, password: string) {
    const isUserExists = await this.prisma.user.findFirst({ where: { email } });
    if (!isUserExists) {
      throw new BadRequestException('User does not exist');
    }

    const isUserExistsInAuth = await this.prisma.auth.findFirst({
      where: { userId: isUserExists.id },
    });

    const isPasswordMatched = await bcrypt.compare(
      password,
      isUserExistsInAuth!.password,
    );

    if (!isPasswordMatched) {
      throw new BadRequestException('Password is incorrect');
    }

    // Send OTP to user via email
    const otpResponse = await this.otpService.sendOtp(isUserExists.id, email);

    return { message: 'OTP sent to your email', otpResponse };
  }

  async verifyOtpAndGenerateToken(email: string, code: string) {
    const user = await this.otpService.verifyOtp(email, code);

    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = generateToken(
      this.jwtService,
      payload,
      envConfig.jwt_access_secret,
      envConfig.jwt_access_expires_in,
    );

    const refreshToken = generateToken(
      this.jwtService,
      payload,
      envConfig.jwt_refresh_secret,
      envConfig.jwt_refresh_expires_in,
    );

    return {
      message: 'Login is successful',
      accessToken,
      refreshToken,
    }
  }
}
