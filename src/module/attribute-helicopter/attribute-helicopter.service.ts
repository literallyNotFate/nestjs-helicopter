import { AttributesDto } from 'src/module/attributes/dto/attributes.dto';
import { plainToInstance } from 'class-transformer';
import { InjectRepository } from '@nestjs/typeorm';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { CreateAttributeHelicopterDto } from './dto/create-attribute-helicopter.dto';
import { UpdateAttributeHelicopterDto } from './dto/update-attribute-helicopter.dto';
import { AttributeHelicopterResponseDto } from './dto/attribute-helicopter.dto';
import { Observable, catchError, from, map, switchMap } from 'rxjs';
import { Repository } from 'typeorm';
import { AttributeHelicopter } from './entities/attribute-helicopter.entity';
import { Attribute } from '../attributes/entities/attribute.entity';
import { HelicopterDto } from '../helicopter/dto/helicopter.dto';
import { In } from 'typeorm';

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
      this.attributeHelicopterRepository.find({
        relations: ['attributes'],
      }),
    ).pipe(map((values) => console.log(values)));
  }

  findOne(id: number) {
    return `This action returns a #${id} attributeHelicopter`;
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
