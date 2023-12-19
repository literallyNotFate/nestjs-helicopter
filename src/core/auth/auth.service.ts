import { UserRepository } from '../../module/user/user.repository';
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { RegisterDto } from './dto/register.dto';

import * as bcrypt from 'bcrypt';
import {
  Observable,
  catchError,
  from,
  map,
  of,
  switchMap,
  take,
  throwError,
} from 'rxjs';
import { JWT_EXPIRATION, JWT_SECRET } from './constants';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly userRepository: UserRepository,
    private readonly usersRepository: UserRepository,
  ) {}

  register(registerData: RegisterDto): Observable<{ accessToken: string }> {
    return from(this.userRepository.getByEmail(registerData.email)).pipe(
      switchMap((existingUser) => {
        if (existingUser) {
          throw new BadRequestException('User with that email already exists');
        }

        return from(bcrypt.hash(registerData.password, 10)).pipe(
          switchMap((hashedPassword) => {
            const newUser = {
              ...registerData,
              password: hashedPassword,
            };

            return from(this.userRepository.create(newUser)).pipe(
              switchMap((createdUser) => {
                delete createdUser.password;
                return this.getJWT(createdUser.id, createdUser.email);
              }),
              catchError(() => {
                return throwError(
                  () => new InternalServerErrorException('Failed to register'),
                );
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
        secret: JWT_SECRET,
        expiresIn: JWT_EXPIRATION,
      }),
    ).pipe(
      map((accessToken) => {
        return { accessToken };
      }),
    );
  }

  getAuth(email: string, password: string) {
    return from(this.usersRepository.getByEmail(email)).pipe(
      take(1),
      map((user) => {
        of(AuthService.verifyPassword(password, user.password));
        return user;
      }),
      catchError(() => {
        throw new BadRequestException('Wrong credentials provided.');
      }),
    );
  }

  static async verifyPassword(password: string, hashed: string) {
    const isPasswordMatching = await bcrypt.compare(password, hashed);

    if (!isPasswordMatching) {
      throw new BadRequestException('Wrong credentials provided.');
    }
  }
}
