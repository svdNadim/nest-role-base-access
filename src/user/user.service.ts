import { BadRequestException, Injectable } from '@nestjs/common';
import bcrypt from 'bcrypt';
import { Role } from 'generated/prisma';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  // Create User with hashed password
  async createUser(data: {
    email: string;
    name: string;
    password: string;
    role?: Role;
  }) {
    // Check the email is alreday exits or not
    const isUserExist = await this.prisma.user.findUnique({
      where: { email: data.email },
    });
    if (isUserExist) {
      throw new BadRequestException('User with this email already exists');
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(data.password, 12);

    // Create User and auth together
    const user = await this.prisma.user.create({
      data: {
        email: data.email,
        name: data.name,
        role: data.role || Role.BUYER,
        auth: {
          create: {
            password: hashedPassword,
          },
        },
      },
    });

    return user;
  }

  // Get all users
  async getAllUsers() {
    return this.prisma.user.findMany();
  }
}
