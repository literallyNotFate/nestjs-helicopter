import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';
import {
  Observable,
  catchError,
  concatMap,
  from,
  map,
  mergeMap,
  of,
  take,
} from 'rxjs';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { plainToInstance } from 'class-transformer';
import { UserDto } from './dto/user.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  create(createUserDto: CreateUserDto): Observable<UserDto> {
    return from(bcrypt.hash(createUserDto.password, 10)).pipe(
      mergeMap((hashed) => {
        createUserDto.password = hashed;
        const user = this.userRepository.create(createUserDto);

        return from(this.userRepository.save(user)).pipe(
          map((result) => plainToInstance(UserDto, result)),
          catchError((error) => {
            if (error?.code === '23505') {
              throw new BadRequestException('This user already exists');
            }

            throw new InternalServerErrorException('Failed to create user');
          }),
        );
      }),
    );
  }

  findAll(): Observable<UserDto[]> {
    return from(
      this.userRepository.find({
        relations: [
          'helicopters',
          'engines',
          'attributeHelicopters',
          'attributes',
        ],
      }),
    ).pipe(
      map((users) => plainToInstance(UserDto, users)),
      catchError(() => {
        throw new InternalServerErrorException('Failed to get all users.');
      }),
    );
  }

  findOne(id: number): Observable<UserDto> {
    return from(this.userRepository.findOne({ where: { id } })).pipe(
      take(1),
      concatMap((found: User) => {
        if (!found) {
          throw new NotFoundException(`User with ID:${id} was not found.`);
        }

        return of(plainToInstance(UserDto, found));
      }),
      catchError(() => {
        throw new InternalServerErrorException(`Failed to get user by ID.`);
      }),
    );
  }

  update(id: number, updateUserDto: UpdateUserDto): Observable<UserDto> {
    return from(bcrypt.hash(updateUserDto.password, 10)).pipe(
      mergeMap((hashedPassword) => {
        updateUserDto.password = hashedPassword;

        return from(this.userRepository.findOne({ where: { id } })).pipe(
          mergeMap((found) => {
            if (!found) {
              throw new NotFoundException(`User with ID:${id} was not found.`);
            }

            const result = this.userRepository.merge(found, updateUserDto);

            return from(this.userRepository.save(result)).pipe(
              map((result) => plainToInstance(UserDto, result)),
              catchError(() => {
                throw new InternalServerErrorException('Failed to update user');
              }),
            );
          }),
        );
      }),
    );
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
