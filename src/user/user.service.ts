import { Injectable } from '@nestjs/common';
import { Role } from '@prisma/client';
import bcrypt from 'bcrypt';
import { PrismaService } from 'prisma/prisma.service';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  // Create User with hashed password
  async createuser(data: {
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
      return {
        message: 'User with this email already exists',
        status: 400,
      };
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
