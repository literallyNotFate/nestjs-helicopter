import { Test, TestingModule } from '@nestjs/testing';
import { AttributeHelicopterService } from './attribute-helicopter.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AttributeHelicopter } from './entities/attribute-helicopter.entity';
import { Attribute } from '../attributes/entities/attribute.entity';
import { Helicopter } from '../helicopter/entities/helicopter.entity';
import { CreateAttributeHelicopterDto } from './dto/create-attribute-helicopter.dto';
import { of, throwError } from 'rxjs';
import { AttributeHelicopterResponseDto } from './dto/attribute-helicopter-response.dto';
import {
  BadRequestException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { UpdateAttributeHelicopterDto } from './dto/update-attribute-helicopter.dto';

describe('AttributeHelicopterService', () => {
  let service: AttributeHelicopterService;
  const REPOSITORY_TOKEN = getRepositoryToken(AttributeHelicopter);

  let attributeRepository;
  let helicopterRepository;

  const mockAttributeHelicopterRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
    merge: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AttributeHelicopterService,
        {
          provide: REPOSITORY_TOKEN,
          useValue: mockAttributeHelicopterRepository,
        },
        {
          provide: getRepositoryToken(Attribute),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            find: jest.fn(),
            findOne: jest.fn(),
            remove: jest.fn(),
            merge: jest.fn(),
            delete: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Helicopter),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            find: jest.fn(),
            findOne: jest.fn(),
            remove: jest.fn(),
            merge: jest.fn(),
            createQueryBuilder: jest.fn(() => ({
              delete: jest.fn().mockReturnThis(),
              from: jest.fn().mockReturnThis(),
              whereInIds: jest.fn().mockReturnThis(),
              execute: jest.fn(),
            })),
          },
        },
      ],
    }).compile();

    service = module.get<AttributeHelicopterService>(
      AttributeHelicopterService,
    );
    attributeRepository = module.get(getRepositoryToken(Attribute));
    helicopterRepository = module.get(getRepositoryToken(Helicopter));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    const createAttributeHelicopterDto: CreateAttributeHelicopterDto = {
      attributeIds: [1, 2],
      values: ['Value 1', 'Value 2'],
    };

    const attributes: Attribute[] = [
      {
        id: createAttributeHelicopterDto.attributeIds[0],
        name: 'Attribute 1',
        createdAt: new Date(),
        updatedAt: new Date(),
        attributeHelicopters: [],
      },
      {
        id: createAttributeHelicopterDto.attributeIds[1],
        name: 'Attribute 2',
        createdAt: new Date(),
        updatedAt: new Date(),
        attributeHelicopters: [],
      },
    ];

    const createdAttributeHelicopter: AttributeHelicopter = {
      id: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
      attributes,
      values: createAttributeHelicopterDto.values,
      helicopters: [],
    };

    const expectedResponse: AttributeHelicopterResponseDto = {
      id: createdAttributeHelicopter.id,
      createdAt: new Date(),
      updatedAt: new Date(),
      attributes: [
        {
          attributeId: createAttributeHelicopterDto.attributeIds[0],
          attribute: {
            id: createAttributeHelicopterDto.attributeIds[0],
            name: attributes[0].name,
            createdAt: attributes[0].createdAt,
            updatedAt: attributes[0].updatedAt,
          },
          value: createAttributeHelicopterDto.values[0],
        },
        {
          attributeId: createAttributeHelicopterDto.attributeIds[1],
          attribute: {
            id: createAttributeHelicopterDto.attributeIds[1],
            name: attributes[1].name,
            createdAt: attributes[1].createdAt,
            updatedAt: attributes[1].updatedAt,
          },
          value: createAttributeHelicopterDto.values[1],
        },
      ],
      helicopters: [],
    };

    it('should create a new attribute helicopter', async () => {
      jest.spyOn(attributeRepository, 'find').mockReturnValue(of(attributes));

      jest
        .spyOn(mockAttributeHelicopterRepository, 'create')
        .mockReturnValue(createdAttributeHelicopter);
      jest
        .spyOn(mockAttributeHelicopterRepository, 'save')
        .mockReturnValue(of(createdAttributeHelicopter));

      const result = await service
        .create(createAttributeHelicopterDto)
        .toPromise();

      expect(result).toMatchObject(expectedResponse);

      expect(attributeRepository.find).toHaveBeenCalledWith({
        where: {
          id: expect.objectContaining({
            _type: 'in',
            _value: createAttributeHelicopterDto.attributeIds,
          }),
        },
      });

      expect(mockAttributeHelicopterRepository.create).toHaveBeenCalledWith({
        values: createAttributeHelicopterDto.values,
        attributes,
      });

      expect(mockAttributeHelicopterRepository.save).toHaveBeenCalledWith(
        createdAttributeHelicopter,
      );
    });

    it('should throw BadRequestException if attributeIds are invalid', async () => {
      jest
        .spyOn(attributeRepository, 'find')
        .mockReturnValue(of(attributes[0]));

      await expect(
        service.create(createAttributeHelicopterDto).toPromise(),
      ).rejects.toThrowError(BadRequestException);

      expect(attributeRepository.find).toHaveBeenCalledWith({
        where: {
          id: expect.objectContaining({
            _type: 'in',
            _value: createAttributeHelicopterDto.attributeIds,
          }),
        },
      });
    });

    it('should throw BadRequestException if attributeIds and values arrays have different lengths', async () => {
      const example: CreateAttributeHelicopterDto = {
        attributeIds: [1, 2, 3],
        values: ['Value 1', 'Value 2'],
      };

      jest.spyOn(attributeRepository, 'find').mockReturnValue(of(attributes));

      await expect(service.create(example).toPromise()).rejects.toThrowError(
        BadRequestException,
      );

      expect(attributeRepository.find).toHaveBeenCalledWith({
        where: {
          id: expect.objectContaining({
            _type: 'in',
            _value: example.attributeIds,
          }),
        },
      });
    });

    it('should throw InternalServerErrorException if an error occurs', async () => {
      jest.spyOn(attributeRepository, 'find').mockReturnValue(of(attributes));

      mockAttributeHelicopterRepository.save.mockResolvedValue(
        createdAttributeHelicopter,
      );

      try {
        await await service.create(createAttributeHelicopterDto).toPromise();
      } catch (error) {
        expect(error).toBeInstanceOf(InternalServerErrorException);
        expect(error.message).toBe('Failed to create attribute helicopter.');
      }

      expect(attributeRepository.find).toHaveBeenCalledWith({
        where: {
          id: expect.objectContaining({
            _type: 'in',
            _value: createAttributeHelicopterDto.attributeIds,
          }),
        },
      });
    });
  });

  describe('findAll', () => {
    const attribute: AttributeHelicopter = {
      id: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
      attributes: [],
      values: [],
      helicopters: [],
    };

    const expectedResponse: AttributeHelicopterResponseDto = {
      id: attribute.id,
      createdAt: new Date(),
      updatedAt: new Date(),
      attributes: [],
      helicopters: [],
    };

    it('should find all attribute helicopters', async () => {
      const attributes = [attribute];
      const attributeHelicopters = [expectedResponse];

      mockAttributeHelicopterRepository.find.mockResolvedValue(attributes);

      const result = await service.findAll().toPromise();

      expect(result).toEqual(attributeHelicopters);

      expect(mockAttributeHelicopterRepository.find).toHaveBeenCalledWith({
        relations: ['attributes', 'helicopters'],
      });
    });

    it('should throw InternalServerErrorException if an error occurs', async () => {
      jest
        .spyOn(mockAttributeHelicopterRepository, 'find')
        .mockResolvedValue(undefined);

      try {
        await service.findAll();
      } catch (error) {
        expect(error).toBeInstanceOf(InternalServerErrorException);
        expect(error.message).toBe('Failed to get all helicopter attributes');
      }
    });
  });

  describe('findOne', () => {
    const attributeHelicopterId: number = 1;

    const attribute: AttributeHelicopter = {
      id: attributeHelicopterId,
      createdAt: new Date(),
      updatedAt: new Date(),
      attributes: [],
      values: [],
      helicopters: [],
    };

    const expectedResponse: AttributeHelicopterResponseDto = {
      id: attributeHelicopterId,
      createdAt: new Date(),
      updatedAt: new Date(),
      attributes: [],
      helicopters: [],
    };

    it('should find attribute helicopter by ID', async () => {
      mockAttributeHelicopterRepository.findOne.mockResolvedValue(attribute);

      const result = await service.findOne(attributeHelicopterId).toPromise();

      expect(result).toEqual(expectedResponse);

      expect(mockAttributeHelicopterRepository.findOne).toHaveBeenCalledWith({
        where: { id: attributeHelicopterId },
        relations: ['attributes', 'helicopters'],
      });
    });

    it('should throw NotFoundException if attribute helicopter is not found by ID', async () => {
      jest
        .spyOn(mockAttributeHelicopterRepository, 'findOne')
        .mockReturnValue(of(null));

      try {
        await service.findOne(attributeHelicopterId);
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
        expect(error.message).toBe(
          `AttributeHelicopter with ID:${attributeHelicopterId} was not found.`,
        );

        expect(mockAttributeHelicopterRepository.findOne).toHaveBeenCalledWith({
          where: { id: attributeHelicopterId },
          relations: ['attributes', 'helicopters'],
        });
      }
    });

    it('should throw InternalServerErrorException if an error occurs', async () => {
      mockAttributeHelicopterRepository.findOne.mockRejectedValueOnce(
        new Error(),
      );

      await expect(
        service.findOne(attributeHelicopterId).toPromise(),
      ).rejects.toThrowError(InternalServerErrorException);

      expect(mockAttributeHelicopterRepository.findOne).toHaveBeenCalledWith({
        where: { id: attributeHelicopterId },
        relations: ['attributes', 'helicopters'],
      });
    });
  });

  describe('update', () => {
    const attributeHelicopterId: number = 1;

    const updateHelicopterAttriuteDto: UpdateAttributeHelicopterDto = {
      attributeIds: [1, 3],
      values: ['Edit 1', 'Edit 3'],
    };

    const attributes: Attribute[] = [
      {
        id: updateHelicopterAttriuteDto.attributeIds[0],
        name: 'Attribute 1',
        createdAt: new Date(),
        updatedAt: new Date(),
        attributeHelicopters: [],
      },
      {
        id: updateHelicopterAttriuteDto.attributeIds[1],
        name: 'Attribute 3',
        createdAt: new Date(),
        updatedAt: new Date(),
        attributeHelicopters: [],
      },
    ];

    const found: AttributeHelicopter = {
      id: attributeHelicopterId,
      createdAt: new Date(),
      updatedAt: new Date(),
      attributes: [],
      values: [],
      helicopters: [],
    };

    const updatedAttributeHelicopter: AttributeHelicopter = {
      id: attributeHelicopterId,
      createdAt: found.createdAt,
      updatedAt: new Date(),
      values: updateHelicopterAttriuteDto.values,
      attributes,
      helicopters: [],
    };

    const expected = AttributeHelicopterResponseDto.ToResponse(
      updatedAttributeHelicopter,
    );

    it('should update an attribute helicopter', async () => {
      jest.spyOn(attributeRepository, 'find').mockReturnValue(of(attributes));

      mockAttributeHelicopterRepository.findOne.mockResolvedValue(found);

      mockAttributeHelicopterRepository.save.mockResolvedValue(
        updatedAttributeHelicopter,
      );

      const result = await service
        .update(attributeHelicopterId, updateHelicopterAttriuteDto)
        .toPromise();

      expect(result).toEqual(expected);

      expect(attributeRepository.find).toHaveBeenCalledWith({
        where: {
          id: expect.objectContaining({
            _type: 'in',
            _value: updateHelicopterAttriuteDto.attributeIds,
          }),
        },
      });

      expect(mockAttributeHelicopterRepository.findOne).toHaveBeenCalledWith({
        where: { id: attributeHelicopterId },
        relations: ['attributes', 'helicopters'],
      });

      expect(mockAttributeHelicopterRepository.save).toHaveBeenCalledWith(
        updatedAttributeHelicopter,
      );
    });

    it('should throw BadRequestException if attributeIds are invalid', async () => {
      jest
        .spyOn(attributeRepository, 'find')
        .mockReturnValue(of(attributes[0]));

      await expect(
        service
          .update(attributeHelicopterId, updateHelicopterAttriuteDto)
          .toPromise(),
      ).rejects.toThrowError(BadRequestException);

      expect(attributeRepository.find).toHaveBeenCalledWith({
        where: {
          id: expect.objectContaining({
            _type: 'in',
            _value: updateHelicopterAttriuteDto.attributeIds,
          }),
        },
      });
    });

    it('should throw BadRequestException if attributeIds and values arrays have different lengths', async () => {
      const example: UpdateAttributeHelicopterDto = {
        attributeIds: [1, 2, 3],
        values: ['Value 1', 'Value 2'],
      };

      jest.spyOn(attributeRepository, 'find').mockReturnValue(of(attributes));

      await expect(
        service.update(attributeHelicopterId, example).toPromise(),
      ).rejects.toThrowError(BadRequestException);

      expect(attributeRepository.find).toHaveBeenCalledWith({
        where: {
          id: expect.objectContaining({
            _type: 'in',
            _value: example.attributeIds,
          }),
        },
      });
    });

    it('should throw NotFoundException if attribute helicopter is not found by ID', async () => {
      jest.spyOn(attributeRepository, 'find').mockResolvedValue(of(attributes));
      jest
        .spyOn(mockAttributeHelicopterRepository, 'findOne')
        .mockResolvedValue(of(null));

      try {
        await service.update(
          attributeHelicopterId,
          updateHelicopterAttriuteDto,
        );
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
        expect(error.message).toBe(
          `AttributeHelicopter with ID:${attributeHelicopterId} was not found.`,
        );

        expect(attributeRepository.find).toHaveBeenCalledWith({
          where: {
            id: expect.objectContaining({
              _type: 'in',
              _value: updateHelicopterAttriuteDto.attributeIds,
            }),
          },
        });

        expect(mockAttributeHelicopterRepository.findOne).toHaveBeenCalledWith({
          where: { id: attributeHelicopterId },
          relations: ['attributes', 'helicopters'],
        });
      }
    });
  });

  describe('remove', () => {
    const attributeHelicopterId: number = 1;

    const deleteAttributeHelicopter = {
      id: attributeHelicopterId,
      attributes: [{ id: 101 }, { id: 102 }],
      helicopters: [{ id: 201 }, { id: 202 }],
    };

    it('should remove attribute helicopter', async () => {
      mockAttributeHelicopterRepository.findOne.mockResolvedValue(
        of(deleteAttributeHelicopter),
      );

      attributeRepository.delete.mockResolvedValue(of(true));

      helicopterRepository
        .createQueryBuilder()
        .delete()
        .from()
        .whereInIds()
        .execute.mockResolvedValue(of(true));

      mockAttributeHelicopterRepository.remove.mockResolvedValue({});

      await service.remove(attributeHelicopterId);

      expect(mockAttributeHelicopterRepository.findOne).toHaveBeenCalledWith({
        where: { id: attributeHelicopterId },
        relations: ['attributes', 'helicopters'],
      });

      // const attributeIds = deleteAttributeHelicopter.attributes.map(
      //   (attr) => attr.id,
      // );
      // const helicopterIds = deleteAttributeHelicopter.helicopters.map(
      //   (heli) => heli.id,
      // );

      // expect(attributeRepository.delete).toHaveBeenCalledWith(attributeIds);
      // expect(
      //   helicopterRepository.createQueryBuilder().delete().from().whereInIds()
      //     .execute,
      // ).toHaveBeenCalledWith(helicopterIds);
      // expect(mockAttributeHelicopterRepository.remove).toHaveBeenCalledWith(
      //   deleteAttributeHelicopter,
      // );
    });

    it('should throw NotFoundException if attribute helicopter not found by ID', async () => {
      mockAttributeHelicopterRepository.findOne.mockResolvedValue(null);

      await expect(
        service.remove(attributeHelicopterId).toPromise(),
      ).rejects.toThrow(NotFoundException);

      expect(mockAttributeHelicopterRepository.findOne).toHaveBeenCalledWith({
        where: { id: attributeHelicopterId },
        relations: ['attributes', 'helicopters'],
      });
    });

    it('should throw InternalServerErrorException if an error occurs', async () => {
      const fail = {
        id: attributeHelicopterId,
        attributes: [],
        helicopters: [],
      };

      jest
        .spyOn(mockAttributeHelicopterRepository, 'findOne')
        .mockReturnValue(of(fail));
      jest
        .spyOn(attributeRepository, 'delete')
        .mockReturnValue(throwError(new Error()));

      await service.remove(attributeHelicopterId).subscribe({
        error: (error) => {
          expect(error).toBeInstanceOf(InternalServerErrorException);
          expect(error.message).toBe(
            'Failed to delete helicopters and attributes associated with the attribute helicopter.',
          );
        },
      });
    });
  });
});
