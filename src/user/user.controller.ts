import { Body, Controller, Get, Post } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user-dto';
import { UserService } from './user.service';

@Controller('users')
export class UserController {
  // Controller methods would go here
  constructor(private readonly userService: UserService) {}

  @Post('create-user')
  async createUser(
    @Body()
    body: CreateUserDto,
  ) {
    return this.userService.createuser(body);
  }

  @Get()
  async getAllUsers() {
    return this.userService.getAllUsers();
  }
}
