import { PickType } from '@nestjs/swagger';
import { UserDto } from './user.dto';

export class CreateUserDto extends PickType(UserDto, [
  'firstName',
  'lastName',
  'email',
  'password',
  'gender',
  'phoneNumber',
] as const) {}
