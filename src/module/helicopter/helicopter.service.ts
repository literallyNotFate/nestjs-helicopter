import { AuthService } from '../../core/auth/auth.service';
import { plainToInstance } from 'class-transformer';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
  Req,
} from '@nestjs/common';
import { HelicopterDto, CreateHelicopterDto, UpdateHelicopterDto } from './dto';
import { Helicopter } from './entities/helicopter.entity';
import {
  Observable,
  catchError,
  concatMap,
  from,
  map,
  mergeMap,
  switchMap,
  toArray,
} from 'rxjs';
import { Engine } from '../engine/entities/engine.entity';
import { AttributeHelicopter } from '../attribute-helicopter/entities/attribute-helicopter.entity';
import { AttributeHelicopterResponseDto } from '../attribute-helicopter/dto';
import { User } from '../user/entities/user.entity';

@Injectable()
export class HelicopterService {
  constructor(
    @InjectRepository(Helicopter)
    private readonly helicopterRepository: Repository<Helicopter>,
    @InjectRepository(Engine)
    private readonly engineRepository: Repository<Engine>,
    @InjectRepository(AttributeHelicopter)
    private readonly attributeHelicopterRepository: Repository<AttributeHelicopter>,
    private readonly authService: AuthService,
  ) {}

  create(
    @Req() request,
    createHelicopterDto: CreateHelicopterDto,
  ): Observable<HelicopterDto> {
    const { attributeHelicopterId, engineId, ...rest } = createHelicopterDto;

    return from(
      this.attributeHelicopterRepository.findOne({
        where: { id: attributeHelicopterId },
        relations: ['attributes', 'creator'],
      }),
    ).pipe(
      switchMap((foundAttribute: AttributeHelicopter) => {
        if (!foundAttribute) {
          throw new NotFoundException(
            `AttributeHelicopter with ID:${attributeHelicopterId} was not found.`,
          );
        }

        return from(
          this.engineRepository.findOne({
            where: { id: engineId },
            relations: ['creator'],
          }),
        ).pipe(
          switchMap((foundEngine: Engine) => {
            if (!foundEngine) {
              throw new NotFoundException(
                `Engine with ID:${engineId} was not found.`,
              );
            }

            return this.authService.getAuthenticatedUser(request).pipe(
              concatMap((auth: User) => {
                const newHelicopter = this.helicopterRepository.create({
                  ...rest,
                  attributeHelicopter: foundAttribute,
                  engine: foundEngine,
                  creator: auth,
                });

                return from(this.helicopterRepository.save(newHelicopter)).pipe(
                  map((helicopter: Helicopter) => {
                    const helicopterDto = plainToInstance(
                      HelicopterDto,
                      helicopter,
                    );

                    if (helicopter.attributeHelicopter) {
                      const attributeHelicopterResponse =
                        AttributeHelicopterResponseDto.ToResponse(
                          foundAttribute,
                        );
                      helicopterDto.attributeHelicopter =
                        attributeHelicopterResponse;
                    }

                    return helicopterDto;
                  }),
                  catchError(() => {
                    throw new InternalServerErrorException(
                      'Failed to create helicopter.',
                    );
                  }),
                );
              }),
            );
          }),
        );
      }),
    );
  }

  findAll(): Observable<HelicopterDto[]> {
    return from(
      this.helicopterRepository.find({ relations: ['creator'] }),
    ).pipe(
      mergeMap((helicopters: Helicopter[]) =>
        from(helicopters).pipe(
          mergeMap((helicopter: Helicopter) =>
            from(
              this.attributeHelicopterRepository.findOne({
                where: { id: helicopter.attributeHelicopterId },
                relations: ['attributes', 'creator'],
              }),
            ).pipe(
              map((attributeHelicopter: AttributeHelicopter) => {
                const helicopterDto = plainToInstance(
                  HelicopterDto,
                  helicopter,
                );

                if (attributeHelicopter) {
                  const attributeHelicopterResponse =
                    AttributeHelicopterResponseDto.ToResponse(
                      attributeHelicopter,
                    );
                  helicopterDto.attributeHelicopter =
                    attributeHelicopterResponse;
                }

                return helicopterDto;
              }),
            ),
          ),
        ),
      ),
      toArray(),
      catchError(() => {
        throw new InternalServerErrorException('Failed to get all helicopters');
      }),
    );
  }

  findOne(id: number): Observable<HelicopterDto> {
    return from(
      this.helicopterRepository.findOne({
        where: { id },
        relations: ['creator'],
      }),
    ).pipe(
      switchMap((helicopter: Helicopter) => {
        if (!helicopter) {
          throw new NotFoundException(
            `Helicopter with ID:${id} was not found.`,
          );
        }

        return from(
          this.attributeHelicopterRepository.findOne({
            where: { id: helicopter.attributeHelicopterId },
            relations: ['attributes'],
          }),
        ).pipe(
          map((attributeHelicopter: AttributeHelicopter) => {
            const helicopterDto = plainToInstance(HelicopterDto, helicopter);

            if (attributeHelicopter) {
              const attributeHelicopterResponse =
                AttributeHelicopterResponseDto.ToResponse(attributeHelicopter);
              helicopterDto.attributeHelicopter = attributeHelicopterResponse;
            }
            return helicopterDto;
          }),
        );
      }),
      catchError(() => {
        throw new InternalServerErrorException(
          'Failed to find the helicopter.',
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
        relations: ['engine', 'attributeHelicopter'],
      }),
    ).pipe(
      concatMap((found: Helicopter) => {
        return from(
          this.engineRepository.findOne({
            where: { id: updateHelicopterDto.engineId },
          }),
        ).pipe(
          concatMap((engine: Engine) => {
            if (!engine) {
              throw new NotFoundException(
                `Engine with ID:${updateHelicopterDto.engineId} was not found.`,
              );
            }

            return from(
              this.attributeHelicopterRepository.findOne({
                where: { id: updateHelicopterDto.attributeHelicopterId },
                relations: ['attributes'],
              }),
            ).pipe(
              concatMap((attributeHelicopter: AttributeHelicopter) => {
                if (!attributeHelicopter) {
                  throw new NotFoundException(
                    `AttributeHelicopter with ID:${updateHelicopterDto.attributeHelicopterId} was not found.`,
                  );
                }

                found.model = updateHelicopterDto.model;
                found.year = updateHelicopterDto.year;
                found.attributeHelicopterId =
                  updateHelicopterDto.attributeHelicopterId;
                found.engineId = updateHelicopterDto.engineId;
                found.engine = engine;
                found.attributeHelicopter = attributeHelicopter;

                return from(this.helicopterRepository.save(found)).pipe(
                  map((result: Helicopter) => {
                    const helicopterDto = plainToInstance(
                      HelicopterDto,
                      result,
                    );

                    if (found.attributeHelicopter) {
                      const attributeHelicopterResponse =
                        AttributeHelicopterResponseDto.ToResponse(
                          found.attributeHelicopter,
                        );
                      helicopterDto.attributeHelicopter =
                        attributeHelicopterResponse;
                      helicopterDto.attributeHelicopter.id =
                        found.attributeHelicopterId;
                    }
                    return helicopterDto;
                  }),
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
      }),
    );
  }

  remove(id: number): Observable<void> {
    return from(this.helicopterRepository.findOne({ where: { id } })).pipe(
      mergeMap((found: Helicopter) => {
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
