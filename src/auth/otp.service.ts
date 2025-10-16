import { BadRequestException, Injectable } from '@nestjs/common';
import nodemailer from 'nodemailer';
import { envConfig } from 'src/config';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class OtpService {
  constructor(private prisma: PrismaService) {}

  // Send OTP to user via email
  async sendOtp(userId: string, email: string) {
    // Create OTP
    const code = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP generation
    const expiresAt = new Date(Date.now() + 2 * 60 * 1000); // OTP valid for 2 minutes

    // Save OTP to database
    const otp = await this.prisma.oTP.create({
      data: {
        code,
        userId,
        expiresAt,
      },
    });

    // Create Transporter for sending email (using nodemailer or any email service)
    const transporter = nodemailer.createTransport({
      host: envConfig.smtp_host,
      port: envConfig.smtp_port,
      secure: true,
      auth: {
        user: envConfig.smtp_user,
        pass: envConfig.smtp_pass,
      },
    });

    // Send OTP email
    await transporter.sendMail({
      from: envConfig.smtp_user,
      to: email,
      subject: 'Your OTP Code',
      text: `Your OTP code is ${code}. It will expire in 2 minutes.`,
    });

    return { message: 'OTP sent successfully', otpId: otp.id };
  }

  // Verify OTP
  async verifyOtp(email: string, code: string) {
    // Check if user exists
    const user = await this.prisma.user.findFirst({
      where: { email },
    });
    if (!user) {
      throw new BadRequestException('User does not exist');
    }

    // Find OTP for the user
    const otp = await this.prisma.oTP.findFirst({
      where: {
        userId: user.id,
        code,
        used: false,
        expiresAt: {
          gt: new Date(), // OTP should not be expired
        },
      },
    });
    if (!otp) {
      throw new BadRequestException('Invalid or expired OTP');
    }

    // Mark OTP as used
    await this.prisma.oTP.update({
      where: { id: otp.id },
      data: { used: true },
    });

    // Delete OTP after successful verification
    await this.prisma.oTP.delete({
      where: { id: otp.id },
    });

    return user;
  }
}
