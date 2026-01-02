import { PickType } from '@nestjs/mapped-types';
import { CreateUserDto } from '../../user/dto';

export class LoginDto extends PickType(CreateUserDto, [
  'email',
  'password',
] as const) {}
