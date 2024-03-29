import { InjectRepository } from '@nestjs/typeorm';
import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  BadRequestException,
  Req,
} from '@nestjs/common';
import {
  UpdateAttributeHelicopterDto,
  CreateAttributeHelicopterDto,
  AttributeHelicopterResponseDto,
} from './dto';

import {
  Observable,
  catchError,
  concatMap,
  from,
  map,
  switchMap,
  take,
} from 'rxjs';
import { Repository, In } from 'typeorm';
import { AttributeHelicopter } from './entities/attribute-helicopter.entity';
import { Attribute } from '../attributes/entities/attribute.entity';
import { Helicopter } from '../helicopter/entities/helicopter.entity';
import { AuthService } from '../../core/auth/auth.service';
import { User } from '../user/entities/user.entity';

@Injectable()
export class AttributeHelicopterService {
  constructor(
    @InjectRepository(AttributeHelicopter)
    private readonly attributeHelicopterRepository: Repository<AttributeHelicopter>,
    @InjectRepository(Attribute)
    private readonly attributeRepository: Repository<Attribute>,
    @InjectRepository(Helicopter)
    private readonly helicopterRepository: Repository<Helicopter>,
    private readonly authService: AuthService,
  ) {}

  create(
    @Req() request,
    createAttributeHelicopterDto: CreateAttributeHelicopterDto,
  ): Observable<AttributeHelicopterResponseDto> {
    const { attributeIds, values } = createAttributeHelicopterDto;

    return from(
      this.attributeRepository.find({
        where: { id: In(attributeIds) },
      }),
    ).pipe(
      concatMap((attributes: Attribute[]) => {
        if (attributes.length !== attributeIds.length) {
          throw new BadRequestException('Some attributeIds are invalid');
        }

        if (attributes.length !== values.length) {
          throw new BadRequestException(
            'attributeIds and values arrays must have the same length',
          );
        }

        return this.authService.getAuthenticatedUser(request).pipe(
          concatMap((auth: User) => {
            const newAttributeHelicopter =
              this.attributeHelicopterRepository.create({
                values,
                attributes,
                creator: auth,
              });

            return from(
              this.attributeHelicopterRepository.save(newAttributeHelicopter),
            ).pipe(
              map((createdAttributeHelicopter: AttributeHelicopter) =>
                AttributeHelicopterResponseDto.ToResponse(
                  createdAttributeHelicopter,
                ),
              ),
            );
          }),
          catchError(() => {
            throw new InternalServerErrorException(
              'Failed to create attribute helicopter.',
            );
          }),
        );
      }),
    );
  }

  findAll(): Observable<AttributeHelicopterResponseDto[]> {
    return from(
      this.attributeHelicopterRepository.find({
        relations: ['attributes', 'helicopters', 'creator'],
      }),
    ).pipe(
      map((ats: AttributeHelicopter[]) => {
        return ats.map((attributeHelicopter: AttributeHelicopter) =>
          AttributeHelicopterResponseDto.ToResponse(attributeHelicopter),
        );
      }),
      catchError(() => {
        throw new InternalServerErrorException(
          'Failed to get all helicopter attributes',
        );
      }),
    );
  }

  findAllByCreator(
    email: string,
  ): Observable<AttributeHelicopterResponseDto[]> {
    return from(
      this.attributeHelicopterRepository.find({
        relations: ['attributes', 'helicopters', 'creator'],
        where: { creator: { email } },
      }),
    ).pipe(
      map((ats: AttributeHelicopter[]) => {
        return ats.map((attributeHelicopter: AttributeHelicopter) =>
          AttributeHelicopterResponseDto.ToResponse(attributeHelicopter),
        );
      }),
      catchError(() => {
        throw new InternalServerErrorException(
          `Failed to get all helicopter attributes of a creator: ${email}`,
        );
      }),
    );
  }

  findOne(id: number): Observable<AttributeHelicopterResponseDto> {
    return from(
      this.attributeHelicopterRepository.findOne({
        where: { id },
        relations: ['attributes', 'helicopters', 'creator'],
      }),
    ).pipe(
      take(1),
      map((attributeHelicopter: AttributeHelicopter) => {
        if (!attributeHelicopter) {
          throw new NotFoundException(
            `AttributeHelicopter with ID:${id} was not found.`,
          );
        }

        return AttributeHelicopterResponseDto.ToResponse(attributeHelicopter);
      }),
      catchError(() => {
        throw new InternalServerErrorException(
          'Failed to get helicopter attribute by ID.',
        );
      }),
    );
  }

  update(
    id: number,
    updateAttributeHelicopterDto: UpdateAttributeHelicopterDto,
  ): Observable<AttributeHelicopterResponseDto> {
    return from(
      this.attributeRepository.find({
        where: { id: In(updateAttributeHelicopterDto.attributeIds) },
      }),
    ).pipe(
      concatMap((attributes: Attribute[]) => {
        if (
          attributes.length !== updateAttributeHelicopterDto.attributeIds.length
        ) {
          throw new BadRequestException('Some attributeIds are invalid');
        }

        if (attributes.length !== updateAttributeHelicopterDto.values.length) {
          throw new BadRequestException(
            'attributeIds and values arrays must have the same length',
          );
        }

        return from(
          this.attributeHelicopterRepository.findOne({
            where: { id },
            relations: ['attributes', 'helicopters', 'creator'],
          }),
        ).pipe(
          concatMap((attributeHelicopter: AttributeHelicopter) => {
            attributeHelicopter.attributes = attributes;
            attributeHelicopter.values = updateAttributeHelicopterDto.values;

            return from(
              this.attributeHelicopterRepository.save(attributeHelicopter),
            ).pipe(
              map((updatedAttributeHelicopter: AttributeHelicopter) => {
                return AttributeHelicopterResponseDto.ToResponse(
                  updatedAttributeHelicopter,
                );
              }),
            );
          }),
          catchError(() => {
            throw new InternalServerErrorException(
              'Failed to update helicopter attribute.',
            );
          }),
        );
      }),
    );
  }

  remove(id: number): Observable<void> {
    return from(
      this.attributeHelicopterRepository.findOne({
        where: { id },
        relations: ['attributes', 'helicopters'],
      }),
    ).pipe(
      concatMap((found: AttributeHelicopter) => {
        const attributeIds = found.attributes.map((attr) => attr.id);
        const helicopterIds = found.helicopters.map((heli) => heli.id);

        return from(this.attributeRepository.delete(attributeIds)).pipe(
          switchMap(() =>
            this.helicopterRepository
              .createQueryBuilder('heli')
              .delete()
              .from(Helicopter)
              .whereInIds(helicopterIds)
              .execute(),
          ),
          concatMap(() => this.attributeHelicopterRepository.remove(found)),
          catchError(() => {
            throw new InternalServerErrorException(
              'Failed to delete helicopters and attributes associated with the attribute helicopter.',
            );
          }),
        );
      }),
      map(() => void 0),
    );
  }
}
