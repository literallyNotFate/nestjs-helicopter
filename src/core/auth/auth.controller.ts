import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Observable, from } from 'rxjs';
import { AuthService } from './auth.service';
import { RegisterDto, TokensDto, LoginDto } from './dto';

@ApiTags('Profile')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({
    summary: 'Register',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Registered',
    type: TokensDto,
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Failed to register',
  })
  @Post('register')
  register(@Body() registrationData: RegisterDto): Observable<TokensDto> {
    return from(this.authService.register(registrationData));
  }

  @ApiOperation({
    summary: 'Login',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Logged in',
    type: TokensDto,
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Failed to login',
  })
  @HttpCode(HttpStatus.OK)
  @Post('login')
  login(@Body() loginData: LoginDto): Observable<TokensDto> {
    return from(this.authService.login(loginData.email, loginData.password));
  }
}
