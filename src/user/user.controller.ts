import {
  Controller,
  Get,
  Body,
  Patch,
  Delete,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { UpdateUserDto } from './dto';
import { JwtAuthGuard } from '../auth/guards';
import { CurrentUser } from '../common/decorators';
import { ApiBearerAuth } from '@nestjs/swagger';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UserControllers {
  constructor(private readonly userService: UserService) {}

  @ApiBearerAuth()
  @Get('me')
  getProfile(@CurrentUser('id') userId: string) {
    return this.userService.findOne(userId);
  }

  @ApiBearerAuth()
  @Patch('me')
  updateProfile(
    @CurrentUser('id') userId: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.userService.update(userId, updateUserDto);
  }

  @ApiBearerAuth()
  @Delete('me')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteAccount(@CurrentUser('id') userId: string) {
    return this.userService.remove(userId);
  }
}
