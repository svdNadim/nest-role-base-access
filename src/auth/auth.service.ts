import { BadRequestException, Injectable } from '@nestjs/common';
import bcrypt from 'bcrypt';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService) {}

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

    return isUserExists;
  }
}
