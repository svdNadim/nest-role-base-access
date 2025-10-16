import { Module } from '@nestjs/common';
import { JwtModule, JwtSignOptions } from '@nestjs/jwt';
import { envConfig } from 'src/config';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { OtpService } from './otp.service';

@Module({
  imports: [
    JwtModule.register({
      secret: envConfig.jwt_access_secret,
      signOptions: {
        expiresIn: envConfig.jwt_access_expires_in,
      } as JwtSignOptions,
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, PrismaService, OtpService],
})
export class AuthModule {}
