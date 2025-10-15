import { Body, Controller, Get, Post } from '@nestjs/common';
import { Role } from '@prisma/client';
import { UserService } from './user.service';

@Controller('users')
export class UserController {
  // Controller methods would go here
  constructor(private readonly userService: UserService) {}

  @Post('create-user')
  async createUser(
    @Body()
    body: {
      email: string;
      name: string;
      password: string;
      role?: Role;
    },
  ) {
    return this.userService.createuser(body);
  }

  @Get()
  async getAllUsers() {
    return this.userService.getAllUsers();
  }
}
