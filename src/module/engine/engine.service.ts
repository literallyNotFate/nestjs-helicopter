import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { CreateEngineDto } from './dto/create-engine.dto';
import { UpdateEngineDto } from './dto/update-engine.dto';
import { Engine } from './entities/engine.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Observable, from, of } from 'rxjs';
import { EngineDto } from './dto/engine.dto';
import { catchError, map, mergeMap, switchMap, take } from 'rxjs/operators';
import { plainToInstance } from 'class-transformer';
import { Helicopter } from '../helicopter/entities/helicopter.entity';

@Injectable()
export class EngineService {
  constructor(
    @InjectRepository(Engine)
    private readonly engineRepository: Repository<Engine>,
    @InjectRepository(Helicopter)
    private readonly helicopterRepository: Repository<Helicopter>,
  ) {}

  create(createEngineDto: CreateEngineDto): Observable<EngineDto> {
    const newEngine = this.engineRepository.create(createEngineDto);

    return from(this.engineRepository.save(newEngine)).pipe(
      map((engine: Engine) => plainToInstance(EngineDto, engine)),
      catchError(() => {
        throw new InternalServerErrorException('Failed to create engine.');
      }),
    );
  }

  findAll(): Observable<EngineDto[]> {
    return from(
      this.engineRepository.find({
        relations: ['helicopters', 'helicopters.attributeHelicopter'],
      }),
    ).pipe(
      map((engines: Engine[]) => plainToInstance(EngineDto, engines)),
      catchError(() => {
        throw new InternalServerErrorException('Failed to get engines.');
      }),
    );
  }

  findOne(id: number): Observable<EngineDto> {
    return from(
      this.engineRepository.findOne({
        where: { id },
        relations: ['helicopters', 'helicopters.attributeHelicopter'],
      }),
    ).pipe(
      take(1),
      mergeMap((found: Engine) => {
        if (!found) {
          throw new NotFoundException(`Engine with ID:${id} was not found.`);
        }

        return of(plainToInstance(EngineDto, found));
      }),
      catchError(() => {
        throw new InternalServerErrorException('Failed to get engine by ID.');
      }),
    );
  }

  update(id: number, updateEngineDto: UpdateEngineDto): Observable<EngineDto> {
    return from(
      this.engineRepository.findOne({
        where: { id },
      }),
    ).pipe(
      take(1),
      mergeMap((found: Engine) => {
        if (!found) {
          throw new NotFoundException(`Engine with ID:${id} was not found.`);
        }

        const updated = this.engineRepository.merge(found, updateEngineDto);

        return from(this.engineRepository.save(updated)).pipe(
          map((result) => plainToInstance(EngineDto, result)),
          catchError(() => {
            throw new InternalServerErrorException('Failed to update engine.');
          }),
        );
      }),
    );
  }

  remove(id: number): Observable<void> {
    return from(
      this.engineRepository.findOne({
        where: { id },
        relations: ['helicopters'],
      }),
    ).pipe(
      switchMap((found: Engine) => {
        if (!found) {
          throw new NotFoundException(`Engine with ID:${id} was not found.`);
        }

        return from(this.helicopterRepository.remove(found.helicopters)).pipe(
          switchMap(() => this.engineRepository.remove(found)),
          catchError(() => {
            throw new InternalServerErrorException(
              'Failed to delete engine or helicopters.',
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
