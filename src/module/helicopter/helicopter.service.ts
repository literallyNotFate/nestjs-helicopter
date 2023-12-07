import { plainToInstance } from 'class-transformer';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { CreateHelicopterDto } from './dto/create-helicopter.dto';
import { UpdateHelicopterDto } from './dto/update-helicopter.dto';
import { Helicopter } from './entities/helicopter.entity';
import {
  Observable,
  catchError,
  from,
  map,
  mergeMap,
  of,
  switchMap,
  take,
} from 'rxjs';
import { HelicopterDto } from './dto/helicopter.dto';
import { Engine } from '../engine/entities/engine.entity';

@Injectable()
export class HelicopterService {
  constructor(
    @InjectRepository(Helicopter)
    private readonly helicopterRepository: Repository<Helicopter>,
    @InjectRepository(Engine)
    private readonly engineRepository: Repository<Engine>,
  ) {}

  create(createHelicopterDto: CreateHelicopterDto): Observable<HelicopterDto> {
    const newHelicopter = this.helicopterRepository.create(createHelicopterDto);

    return from(this.helicopterRepository.save(newHelicopter)).pipe(
      map((helicopter: Helicopter) =>
        plainToInstance(HelicopterDto, helicopter),
      ),
      catchError(() => {
        throw new InternalServerErrorException('Failed to create helicopter.');
      }),
    );
  }

  findAll(): Observable<HelicopterDto[]> {
    return from(this.helicopterRepository.find()).pipe(
      map((helicopters: Helicopter[]) =>
        plainToInstance(HelicopterDto, helicopters),
      ),
      catchError(() => {
        throw new InternalServerErrorException(
          'Failed to get all helicopters.',
        );
      }),
    );
  }

  findOne(id: number): Observable<HelicopterDto> {
    return from(this.helicopterRepository.findOne({ where: { id } })).pipe(
      take(1),
      mergeMap((helicopter: Helicopter) => {
        if (!helicopter) {
          throw new NotFoundException(
            `Helicopter with ID:${id} was not found.`,
          );
        }

        return of(plainToInstance(HelicopterDto, helicopter));
      }),
      catchError(() => {
        throw new InternalServerErrorException(
          `Failed to get helicopter by ID.`,
        );
      }),
    );
  }

  update(
    id: number,
    updateHelicopterDto: UpdateHelicopterDto,
  ): Observable<HelicopterDto> {
    return from(
      this.helicopterRepository.findOne({
        where: { id },
        relations: ['engine'],
      }),
    ).pipe(
      switchMap((found: Helicopter) => {
        if (!found) {
          throw new NotFoundException(
            `Helicopter with ID:${id} was not found.`,
          );
        }

        return from(
          this.engineRepository.findOne({
            where: { id: updateHelicopterDto.engineId },
          }),
        ).pipe(
          switchMap((engine: Engine) => {
            if (!engine) {
              throw new NotFoundException(
                `Engine with ID:${updateHelicopterDto.engineId} was not found.`,
              );
            }

            found.model = updateHelicopterDto.model;
            found.year = updateHelicopterDto.year;
            found.engineId = updateHelicopterDto.engineId;
            found.engine = engine;

            return from(this.helicopterRepository.save(found)).pipe(
              map((result: Helicopter) =>
                plainToInstance(HelicopterDto, result),
              ),
              catchError(() => {
                throw new InternalServerErrorException(
                  'Failed to update helicopter.',
                );
              }),
            );
          }),
        );
      }),
    );
  }

  remove(id: number): Observable<void> {
    return from(this.helicopterRepository.findOne({ where: { id } })).pipe(
      mergeMap((found: Helicopter) => {
        if (!found) {
          throw new NotFoundException(
            `Helicopter with ID:${id} was not found.`,
          );
        }

        return from(this.helicopterRepository.remove(found)).pipe(
          catchError(() => {
            throw new InternalServerErrorException(
              'Failed to delete helicopter.',
            );
          }),
        );
      }),
      map(() => {
        return void 0;
      }),
    );
  }
}
