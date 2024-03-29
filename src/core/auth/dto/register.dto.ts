import { PickType } from '@nestjs/swagger';
import { CreateUserDto } from '../../../module/user/dto/create-user.dto';

export class RegisterDto extends PickType(CreateUserDto, [
  'email',
  'firstName',
  'lastName',
  'phoneNumber',
  'password',
] as const) {}
