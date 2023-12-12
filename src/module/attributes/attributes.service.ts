import { plainToInstance } from 'class-transformer';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateAttributeDto } from './dto/create-attribute.dto';
import { UpdateAttributeDto } from './dto/update-attribute.dto';
import { Attribute } from './entities/attribute.entity';
import { Repository } from 'typeorm';
import { Observable, catchError, from, map, mergeMap, of, take } from 'rxjs';
import { AttributesDto } from './dto/attributes.dto';

@Injectable()
export class AttributesService {
  constructor(
    @InjectRepository(Attribute)
    private readonly attributeRepository: Repository<Attribute>,
  ) {}

  create(createAttributeDto: CreateAttributeDto): Observable<AttributesDto> {
    const newAttribute = this.attributeRepository.create(createAttributeDto);

    return from(this.attributeRepository.save(newAttribute)).pipe(
      map((attribute: Attribute) => plainToInstance(AttributesDto, attribute)),
      catchError(() => {
        throw new InternalServerErrorException('Failed to create attribute.');
      }),
    );
  }

  findAll(): Observable<AttributesDto[]> {
    return from(this.attributeRepository.find()).pipe(
      map((attributes: Attribute[]) =>
        plainToInstance(AttributesDto, attributes),
      ),
      catchError(() => {
        throw new InternalServerErrorException('Failed to get all attributes.');
      }),
    );
  }

  findOne(id: number): Observable<AttributesDto> {
    return from(this.attributeRepository.findOne({ where: { id } })).pipe(
      take(1),
      mergeMap((found: Attribute) => {
        if (!found) {
          throw new NotFoundException(`Attribute with ID:${id} was not found.`);
        }

        return of(plainToInstance(AttributesDto, found));
      }),
      catchError(() => {
        throw new InternalServerErrorException(
          `Failed to get attribute by ID.`,
        );
      }),
    );
  }

  update(
    id: number,
    updateAttributeDto: UpdateAttributeDto,
  ): Observable<AttributesDto> {
    return from(this.attributeRepository.findOne({ where: { id } })).pipe(
      take(1),
      mergeMap((found: Attribute) => {
        if (!found) {
          throw new NotFoundException(`Attribute with ID:${id} was not found.`);
        }

        const updated = this.attributeRepository.merge(
          found,
          updateAttributeDto,
        );

        return from(this.attributeRepository.save(updated)).pipe(
          map((attribute: Attribute) =>
            plainToInstance(AttributesDto, attribute),
          ),
          catchError(() => {
            throw new InternalServerErrorException('Failed to edit attribute.');
          }),
        );
      }),
    );
  }

  remove(id: number): Observable<void> {
    return from(this.attributeRepository.findOne({ where: { id } })).pipe(
      take(1),
      mergeMap((found: Attribute) => {
        if (!found) {
          throw new NotFoundException(`Attribute with ID: ${id} not found`);
        }

        return from(this.attributeRepository.remove(found)).pipe(
          catchError(() => {
            throw new InternalServerErrorException(
              'Failed to delete attribute',
            );
          }),
        );
      }),
      map(() => void 0),
    );
  }
}
