import { plainToInstance } from 'class-transformer';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { CreateAttributeHelicopterDto } from './dto/create-attribute-helicopter.dto';
import { UpdateAttributeHelicopterDto } from './dto/update-attribute-helicopter.dto';
import { AttributeHelicopterDto } from './dto/attribute-helicopter.dto';
import { Observable, catchError, from, map, mergeMap } from 'rxjs';
import { Repository } from 'typeorm';
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

  create(createAttributeHelicopterDto: CreateAttributeHelicopterDto): string {
    // const { helicopterId, attributeId } = createAttributeHelicopterDto;
    // return from(
    //   this.helicopterRepository.findOne({ where: { id: helicopterId } }),
    // ).pipe(
    //   mergeMap((found: Helicopter) => {
    //     if (!found) {
    //       throw new NotFoundException(
    //         `Helicopter with ID:${helicopterId} was not found.`,
    //       );
    //     }
    //     return from(
    //       this.attributeRepository.findOne({ where: { id: attributeId } }),
    //     ).pipe(
    //       mergeMap((found: Attribute) => {
    //         if (!found) {
    //           throw new NotFoundException(
    //             `Attribute with ID:${attributeId} was not found.`,
    //           );
    //         }
    //         const newAttributeHelicopter =
    //           this.attributeHelicopterRepository.create(
    //             createAttributeHelicopterDto,
    //           );
    //         return from(
    //           this.attributeHelicopterRepository.save(newAttributeHelicopter),
    //         ).pipe(
    //           map((saved: AttributeHelicopter) =>
    //             plainToInstance(AttributeHelicopterDto, saved),
    //           ),
    //           catchError(() => {
    //             throw new InternalServerErrorException(
    //               `Failed to create Attribute Helicopter`,
    //             );
    //           }),
    //         );
    //       }),
    //       catchError(() => {
    //         throw new Error(`Failed to find Attribute`);
    //       }),
    //     );
    //   }),
    //   catchError(() => {
    //     throw new Error(`Failed to find Helicopter`);
    //   }),
    // );

    return '';
  }

  findAll() {
    return `This action returns all attributeHelicopter`;
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
