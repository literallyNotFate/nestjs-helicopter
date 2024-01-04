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
import { HelicopterDto } from '../helicopter/dto/helicopter.dto';
import { EngineDto } from '../engine/dto/engine.dto';
import { AttributesDto } from '../attributes/dto/attributes.dto';
import { AttributeHelicopterResponseDto } from '../attribute-helicopter/dto/attribute-helicopter-response.dto';
import { Helicopter } from '../helicopter/entities/helicopter.entity';
import { Engine } from '../engine/entities/engine.entity';
import { AttributeHelicopter } from '../attribute-helicopter/entities/attribute-helicopter.entity';
import { Attribute } from '../attributes/entities/attribute.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Helicopter)
    private readonly helicopterRepository: Repository<Helicopter>,
    @InjectRepository(Engine)
    private readonly engineRepository: Repository<Engine>,
    @InjectRepository(AttributeHelicopter)
    private readonly attributeHelicopterRepository: Repository<AttributeHelicopter>,
    @InjectRepository(Attribute)
    private readonly attributeRepository: Repository<Attribute>,
  ) {}

  create(createUserDto: CreateUserDto): Observable<UserDto> {
    return from(bcrypt.hash(createUserDto.password, 10)).pipe(
      mergeMap((hashed) => {
        createUserDto.password = hashed;
        const user = this.userRepository.create(createUserDto);

        return from(this.userRepository.save(user)).pipe(
          map((result) => this.mapToUserDto(result)),
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
          'attributeHelicopters',
          'attributes',
          'engines',
        ],
      }),
    ).pipe(
      map((users: User[]) => users.map((user) => this.mapToUserDto(user))),
      catchError(() => {
        throw new InternalServerErrorException('Failed to get all users.');
      }),
    );
  }

  findOne(id: number): Observable<UserDto> {
    return from(
      this.userRepository.findOne({
        where: { id },
        relations: [
          'helicopters',
          'attributeHelicopters',
          'attributes',
          'engines',
        ],
      }),
    ).pipe(
      take(1),
      concatMap((found: User) => {
        if (!found) {
          throw new NotFoundException(`User with ID:${id} was not found.`);
        }

        return of(this.mapToUserDto(found));
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

        return from(
          this.userRepository.findOne({
            where: { id },
            relations: [
              'helicopters',
              'attributeHelicopters',
              'attributes',
              'engines',
            ],
          }),
        ).pipe(
          mergeMap((found) => {
            if (!found) {
              throw new NotFoundException(`User with ID:${id} was not found.`);
            }

            const result = this.userRepository.merge(found, updateUserDto);

            return from(this.userRepository.save(result)).pipe(
              map((result) => this.mapToUserDto(result)),
              catchError(() => {
                throw new InternalServerErrorException('Failed to update user');
              }),
            );
          }),
        );
      }),
    );
  }

  remove(id: number): Observable<void> {
    return from(
      this.userRepository.findOne({
        where: { id },
        relations: [
          'helicopters',
          'helicopters.attributeHelicopter',
          'attributes',
          'engines',
          'attributeHelicopters',
        ],
      }),
    ).pipe(
      take(1),
      mergeMap((found: User) => {
        if (!found) {
          throw new NotFoundException(`User with ID: ${id} not found`);
        }

        return from(this.userRepository.remove(found)).pipe(
          concatMap(() => this.helicopterRepository.remove(found.helicopters)),
          concatMap(() => this.engineRepository.remove(found.engines)),
          concatMap(() =>
            this.attributeHelicopterRepository.remove(
              found.attributeHelicopters,
            ),
          ),
          concatMap(() => this.attributeRepository.remove(found.attributes)),
          catchError(() => {
            throw new InternalServerErrorException(
              'Failed to delete user or related data.',
            );
          }),
        );
      }),
      map(() => void 0),
    );
  }

  private mapToUserDto(user: User): UserDto {
    const userDto = plainToInstance(UserDto, user);

    userDto.helicopters = user.helicopters.map((helicopter) =>
      plainToInstance(HelicopterDto, helicopter),
    );

    userDto.engines = user.engines.map((engine) =>
      plainToInstance(EngineDto, engine),
    );

    userDto.attributes = user.attributes.map((attribute) =>
      plainToInstance(AttributesDto, attribute),
    );

    userDto.attributeHelicopters = user.attributeHelicopters.map((ah) =>
      AttributeHelicopterResponseDto.ToResponse(ah),
    );

    return userDto;
  }
}
