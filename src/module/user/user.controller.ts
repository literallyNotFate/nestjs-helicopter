import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpStatus,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UserDto } from './dto/user.dto';
import { Observable, from } from 'rxjs';

@ApiTags('User')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @ApiOperation({ summary: 'Endpoint to create user' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'User was created',
    type: UserDto,
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Failed to create user',
  })
  @Post()
  create(@Body() createUserDto: CreateUserDto): Observable<UserDto> {
    return from(this.userService.create(createUserDto));
  }

  @ApiOperation({ summary: 'Endpoint to get all users' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Got all users',
    type: [UserDto],
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Failed to get users',
  })
  @Get()
  findAll(): Observable<UserDto[]> {
    return from(this.userService.findAll());
  }

  @ApiOperation({ summary: 'Endpoint to get user by ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Got user by ID',
    type: UserDto,
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Failed to get user by ID',
  })
  @Get(':id')
  findOne(@Param('id') id: string): Observable<UserDto> {
    return this.userService.findOne(+id);
  }

  @ApiOperation({ summary: 'Endpoint to edit user by ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User was edited',
    type: UserDto,
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Failed to edit user',
  })
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(+id, updateUserDto);
  }

  @ApiOperation({ summary: 'Endpoint to delete user by ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User was deleted',
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Failed to delete user',
  })
  @Delete(':id')
  remove(@Param('id') id: string): Observable<void> {
    return this.userService.remove(+id);
  }
}
