import { InjectRepository } from '@nestjs/typeorm';
import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { CreateAttributeHelicopterDto } from './dto/create-attribute-helicopter.dto';
import { UpdateAttributeHelicopterDto } from './dto/update-attribute-helicopter.dto';
import { AttributeHelicopterResponseDto } from './dto/attribute-helicopter.dto';
import { Observable, catchError, from, map, switchMap, take } from 'rxjs';
import { Repository, In } from 'typeorm';
import { AttributeHelicopter } from './entities/attribute-helicopter.entity';
import { Attribute } from '../attributes/entities/attribute.entity';
import { Helicopter } from '../helicopter/entities/helicopter.entity';

@Injectable()
export class AttributeHelicopterService {
  constructor(
    @InjectRepository(AttributeHelicopter)
    private readonly attributeHelicopterRepository: Repository<AttributeHelicopter>,
    @InjectRepository(Attribute)
    private readonly attributeRepository: Repository<Attribute>,
    @InjectRepository(Helicopter)
    private readonly helicopterRepository: Repository<Helicopter>,
  ) {}

  create(
    createAttributeHelicopterDto: CreateAttributeHelicopterDto,
  ): Observable<AttributeHelicopterResponseDto> {
    const { attributeIds, values } = createAttributeHelicopterDto;

    return from(
      this.attributeRepository.find({
        where: { id: In(attributeIds) },
      }),
    ).pipe(
      switchMap((attributes: Attribute[]) => {
        if (attributes.length !== attributeIds.length) {
          throw new BadRequestException('Some attributeIds are invalid');
        }

        if (attributes.length !== values.length) {
          throw new BadRequestException(
            'attributeIds and values arrays must have the same length',
          );
        }

        const newAttributeHelicopter =
          this.attributeHelicopterRepository.create({
            values,
            attributes,
          });

        return from(
          this.attributeHelicopterRepository.save(newAttributeHelicopter),
        ).pipe(
          map((createdAttributeHelicopter: AttributeHelicopter) =>
            AttributeHelicopterResponseDto.ToResponse(
              createdAttributeHelicopter,
            ),
          ),
          catchError(() => {
            throw new InternalServerErrorException(
              'Failed to create attribute helicopter',
            );
          }),
        );
      }),
    );
  }

  findAll() {
    return from(
      this.attributeHelicopterRepository.find({ relations: ['attributes'] }),
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

  findOne(id: number): Observable<AttributeHelicopterResponseDto> {
    return from(
      this.attributeHelicopterRepository.findOne({
        where: { id },
        relations: ['attributes'],
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
      switchMap((attributes: Attribute[]) => {
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
            relations: ['attributes'],
          }),
        ).pipe(
          switchMap((attributeHelicopter: AttributeHelicopter) => {
            if (!attributeHelicopter) {
              throw new NotFoundException(
                `AttributeHelicopter with ID:${id} was not found.`,
              );
            }

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
        relations: ['attributes'],
      }),
    ).pipe(
      switchMap((found: AttributeHelicopter) => {
        if (!found) {
          throw new NotFoundException(
            `AttributeHelicopter with ID:${id} was not found.`,
          );
        }

        const attributeIds = found.attributes.map((attr) => attr.id);

        return from(
          this.attributeHelicopterRepository
            .createQueryBuilder('ah')
            .relation(AttributeHelicopter, 'attributes')
            .of(found)
            .remove(attributeIds)
            .then(async () => {
              await this.attributeHelicopterRepository.remove(found);
              await this.attributeRepository.delete(attributeIds);
            })
            .catch(() => {
              throw new InternalServerErrorException(
                'Failed to delete attribute helicopter or attributes.',
              );
            }),
        );
      }),
      map(() => void 0),
    );
  }
}
