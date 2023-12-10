import { AttributesDto } from 'src/module/attributes/dto/attributes.dto';
import { plainToInstance } from 'class-transformer';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateAttributeHelicopterDto } from './dto/create-attribute-helicopter.dto';
import { UpdateAttributeHelicopterDto } from './dto/update-attribute-helicopter.dto';
import { AttributeHelicopterResponseDto } from './dto/attribute-helicopter.dto';
import { Observable, catchError, from, map, switchMap, take } from 'rxjs';
import { Repository, In } from 'typeorm';
import { AttributeHelicopter } from './entities/attribute-helicopter.entity';
import { Attribute } from '../attributes/entities/attribute.entity';
import { HelicopterDto } from '../helicopter/dto/helicopter.dto';

@Injectable()
export class AttributeHelicopterService {
  constructor(
    @InjectRepository(AttributeHelicopter)
    private readonly attributeHelicopterRepository: Repository<AttributeHelicopter>,
    @InjectRepository(Attribute)
    private readonly attributeRepository: Repository<Attribute>,
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
          throw new InternalServerErrorException(
            'Some attributeIds are invalid',
          );
        }

        if (attributes.length !== values.length) {
          throw new InternalServerErrorException(
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
          map((createdAttributeHelicopter: AttributeHelicopter) => {
            const responseDto = new AttributeHelicopterResponseDto();
            responseDto.id = createdAttributeHelicopter.id;
            responseDto.createdAt = createdAttributeHelicopter.createdAt;
            responseDto.updatedAt = createdAttributeHelicopter.updatedAt;

            responseDto.attributeHelicopter =
              createdAttributeHelicopter.attributes.map((attr, index) => ({
                attributeId: attr.id,
                attribute: plainToInstance(AttributesDto, attributes[index]),
                value: values[index],
              }));

            responseDto.helicopters = plainToInstance(
              HelicopterDto,
              createdAttributeHelicopter.helicopters,
            );

            return responseDto;
          }),
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
      map((attributeHelicopters: AttributeHelicopter[]) => {
        return attributeHelicopters.map((helicopter: AttributeHelicopter) => {
          const responseDto = new AttributeHelicopterResponseDto();
          responseDto.id = helicopter.id;
          responseDto.createdAt = helicopter.createdAt;
          responseDto.updatedAt = helicopter.updatedAt;

          responseDto.attributeHelicopter = helicopter.attributes.map(
            (attr, index) => ({
              attributeId: attr.id,
              attribute: plainToInstance(AttributesDto, attr),
              value: helicopter.values ? helicopter.values[index] : null,
            }),
          );

          responseDto.helicopters = plainToInstance(
            HelicopterDto,
            helicopter.helicopters,
          );

          return responseDto;
        });
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

        const responseDto = new AttributeHelicopterResponseDto();
        responseDto.id = attributeHelicopter.id;
        responseDto.createdAt = attributeHelicopter.createdAt;
        responseDto.updatedAt = attributeHelicopter.updatedAt;

        responseDto.attributeHelicopter = attributeHelicopter.attributes.map(
          (attr, index) => ({
            attributeId: attr.id,
            attribute: plainToInstance(AttributesDto, attr),
            value: attributeHelicopter.values
              ? attributeHelicopter.values[index]
              : null,
          }),
        );

        responseDto.helicopters = plainToInstance(
          HelicopterDto,
          attributeHelicopter.helicopters,
        );

        return responseDto;
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
  ) {
    return `This action updates a #${id} attributeHelicopter`;
  }

  remove(id: number) {
    return `This action removes a #${id} attributeHelicopter`;
  }
}
