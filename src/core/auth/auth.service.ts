import { UserRepository } from '../../module/user/user.repository';
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { RegisterDto, TokensDto } from './dto';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { Observable, catchError, concatMap, from, map, switchMap } from 'rxjs';
import { User } from '../../module/user/entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly userRepository: UserRepository,
    private readonly usersRepository: UserRepository,
  ) {}

  register(registerData: RegisterDto): Observable<{ accessToken: string }> {
    return from(this.userRepository.getByEmail(registerData.email)).pipe(
      switchMap((existing: User) => {
        if (existing) {
          throw new BadRequestException('User with that email already exists');
        }

        return from(bcrypt.hash(registerData.password, 10)).pipe(
          switchMap((hashedPassword: string) => {
            const newUser = {
              ...registerData,
              password: hashedPassword,
            };

            return from(this.userRepository.create(newUser)).pipe(
              switchMap((created: User) => {
                return this.getJWT(created.id, created.email);
              }),
              catchError(() => {
                throw new InternalServerErrorException('Failed to register');
              }),
            );
          }),
        );
      }),
    );
  }

  getJWT(userId: number, email: string): Observable<{ accessToken: string }> {
    const payload = {
      sub: userId,
      email: email,
    };

    return from(
      this.jwtService.signAsync(payload, {
        secret: process.env.JWT_ACCESS_TOKEN_SECRET,
        expiresIn: process.env.JWT_ACCESS_TOKEN_EXPIRATION_TIME,
      }),
    ).pipe(
      map((accessToken: string) => {
        return { accessToken };
      }),
    );
  }

  login(email: string, password: string): Observable<TokensDto> {
    return from(this.usersRepository.getByEmail(email)).pipe(
      concatMap((user: User) => {
        if (!user) {
          throw new BadRequestException('Wrong credentials provided');
        }

        return from(this.verifyPassword(password, user.password)).pipe(
          switchMap((isPasswordValid: boolean) => {
            if (!isPasswordValid) {
              throw new BadRequestException('Wrong credentials provided');
            }

            return this.getJWT(user.id, user.email);
          }),
          catchError(() => {
            throw new InternalServerErrorException('Failed to login');
          }),
        );
      }),
    );
  }

  async verifyPassword(password: string, hashed: string) {
    const isPasswordMatching = await bcrypt.compare(password, hashed);
    return isPasswordMatching;
  }

  getAuthenticatedUser(request: Request): Observable<User> {
    const authHeader = request.headers['authorization'];

    if (!authHeader) {
      throw new Error('Authorization header is missing');
    }

    const token = authHeader.split(' ')[1];
    const payload = this.jwtService.verify(token);

    const { email } = payload;
    const user = this.userRepository.getByEmail(email);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return user;
  }
}
