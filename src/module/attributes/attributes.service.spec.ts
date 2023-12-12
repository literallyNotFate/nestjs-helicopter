import { AttributesDto } from './dto/attributes.dto';
import { plainToInstance } from 'class-transformer';
import { Test, TestingModule } from '@nestjs/testing';
import { AttributesService } from './attributes.service';
import { Attribute } from './entities/attribute.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { lastValueFrom, of, throwError } from 'rxjs';
import {
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateAttributeDto } from './dto/create-attribute.dto';
import { UpdateAttributeDto } from './dto/update-attribute.dto';

describe('AttributesService', () => {
  let service: AttributesService;
  const REPOSITORY_TOKEN = getRepositoryToken(Attribute);

  const mockAttributeRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
    merge: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AttributesService,
        {
          provide: REPOSITORY_TOKEN,
          useValue: mockAttributeRepository,
        },
      ],
    }).compile();

    service = module.get<AttributesService>(AttributesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create an attribute', async () => {
      const createAttributeDto: CreateAttributeDto = {
        name: 'Color',
      };

      const attributeResult: Attribute = {
        id: 1,
        name: 'Color',
        attributeHelicopters: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      jest
        .spyOn(mockAttributeRepository, 'create')
        .mockReturnValue(attributeResult);
      jest
        .spyOn(mockAttributeRepository, 'save')
        .mockReturnValue(of(attributeResult));

      const observableResult = service.create(createAttributeDto);
      const result = await observableResult.toPromise();

      expect(mockAttributeRepository.create).toHaveBeenCalledWith(
        createAttributeDto,
      );
      expect(mockAttributeRepository.save).toHaveBeenCalledWith(
        attributeResult,
      );
      expect(result).toEqual(plainToInstance(AttributesDto, attributeResult));
    });

    it('should throw InternalServerErrorException if an error occurs', async () => {
      const createAttributeDto: CreateAttributeDto = {
        name: 'Color',
      };

      const attributeResult: Attribute = {
        id: 1,
        name: 'Color',
        attributeHelicopters: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      jest
        .spyOn(mockAttributeRepository, 'create')
        .mockReturnValue(attributeResult);
      jest
        .spyOn(mockAttributeRepository, 'save')
        .mockReturnValue(throwError(new Error('Database error')));

      try {
        await service.create(createAttributeDto);
      } catch (error) {
        expect(error).toBeInstanceOf(InternalServerErrorException);
        expect(error.message).toBe('Failed to create attribute.');
      }
    });
  });

  describe('findAll', () => {
    it('should find all attributes', async () => {
      const attributeResult: Attribute = {
        id: 1,
        name: 'Color',
        attributeHelicopters: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const attributes = [attributeResult];

      jest
        .spyOn(mockAttributeRepository, 'find')
        .mockReturnValue(of(attributes));

      const find = service.findAll();
      const result = await lastValueFrom(find);

      expect(result).toEqual(attributes);
      expect(mockAttributeRepository.find).toHaveBeenCalled();
    });

    it('should throw InternalServerErrorException if an error occurs', async () => {
      jest
        .spyOn(mockAttributeRepository, 'find')
        .mockReturnValue(throwError(new Error('Database error')));

      try {
        await service.findAll();
      } catch (error) {
        expect(error).toBeInstanceOf(InternalServerErrorException);
        expect(error.message).toBe('Failed to get all attributes.');
      }
    });
  });

  describe('findOne', () => {
    it('should find attribute by ID', async () => {
      const attributeId: number = 1;

      const attributeResult: Attribute = {
        id: attributeId,
        name: 'Color',
        attributeHelicopters: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      jest
        .spyOn(mockAttributeRepository, 'findOne')
        .mockReturnValue(of(attributeResult));

      const find = service.findOne(attributeId);
      const result = await lastValueFrom(find);

      expect(mockAttributeRepository.findOne).toHaveBeenCalledWith({
        where: { id: attributeId },
      });
      expect(result).toEqual(plainToInstance(AttributesDto, attributeResult));
    });

    it('should throw NotFoundException if attribute is not found by ID', async () => {
      const attributeId: number = 1;

      jest.spyOn(mockAttributeRepository, 'findOne').mockReturnValue(of(null));

      try {
        await service.findOne(attributeId);
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
        expect(error.message).toBe(
          `Attribute with ID:${attributeId} was not found.`,
        );
      }
    });

    it('should throw InternalServerErrorException if an error occurs', async () => {
      const attributeId = 1;

      jest
        .spyOn(mockAttributeRepository, 'findOne')
        .mockReturnValue(throwError(new Error('Database error')));

      try {
        await service.findOne(attributeId);
      } catch (error) {
        expect(error).toBeInstanceOf(InternalServerErrorException);
        expect(error.message).toBe('Failed to get attribute by ID.');
      }
    });
  });

  describe('update', () => {
    it('should update an attribute', async () => {
      const attributeId = 1;
      const updateAttributeDto: UpdateAttributeDto = {
        name: 'edited',
      };

      const found: Attribute = {
        id: attributeId,
        name: 'Color',
        attributeHelicopters: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const updated: Attribute = {
        ...found,
        name: updateAttributeDto.name,
        updatedAt: new Date(),
      };

      mockAttributeRepository.findOne.mockReturnValue(of(found));
      mockAttributeRepository.merge.mockReturnValue(updated);
      mockAttributeRepository.save.mockReturnValue(of(updated));

      const result = await service
        .update(attributeId, updateAttributeDto)
        .toPromise();

      expect(mockAttributeRepository.findOne).toHaveBeenCalledWith({
        where: { id: attributeId },
      });

      expect(mockAttributeRepository.merge).toHaveBeenCalledWith(
        found,
        updateAttributeDto,
      );

      expect(mockAttributeRepository.save).toHaveBeenCalledWith(updated);
      expect(result).toEqual(updated);
    });

    it('should throw NotFoundException if attribute is not found by ID', async () => {
      const attributeId: number = 1;
      const updateAttributeDto: UpdateAttributeDto = {
        name: 'edited',
      };

      jest
        .spyOn(mockAttributeRepository, 'findOne')
        .mockResolvedValue(undefined);

      await expect(
        service.update(attributeId, updateAttributeDto).toPromise(),
      ).rejects.toThrow(NotFoundException);

      expect(mockAttributeRepository.findOne).toHaveBeenCalledWith({
        where: { id: attributeId },
      });

      expect(mockAttributeRepository.merge).not.toHaveBeenCalled();
      expect(mockAttributeRepository.save).not.toHaveBeenCalled();
    });

    it('should throw InternalServerErrorException if an error occurs', async () => {
      const attributeId: number = 1;

      const updateAttributeDto: UpdateAttributeDto = {
        name: 'edit',
      };

      const found: Attribute = {
        id: attributeId,
        name: 'Color',
        attributeHelicopters: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      jest.spyOn(mockAttributeRepository, 'findOne').mockResolvedValue(found);

      try {
        await service.update(attributeId, updateAttributeDto).toPromise();
      } catch (error) {
        expect(error).toBeInstanceOf(InternalServerErrorException);
        expect(error.message).toBe('Failed to edit attribute.');
      }
    });
  });

  describe('remove', () => {
    it('should remove attribute', async () => {
      const attributeId: number = 1;

      const foundAttribute: Attribute = {
        id: attributeId,
        name: 'Color',
        attributeHelicopters: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockAttributeRepository.findOne.mockResolvedValue(foundAttribute);
      mockAttributeRepository.remove.mockResolvedValue(foundAttribute);

      await service.remove(attributeId).toPromise();

      expect(mockAttributeRepository.findOne).toHaveBeenCalledWith({
        where: { id: attributeId },
      });
      expect(mockAttributeRepository.remove).toHaveBeenCalledWith(
        foundAttribute,
      );
    });

    it('should throw NotFoundException if attribute is not found by ID', async () => {
      const attributeId: number = 1;

      jest.spyOn(mockAttributeRepository, 'findOne').mockReturnValue(of(null));

      try {
        await service.findOne(attributeId);
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
        expect(error.message).toBe(
          `Attribute with ID:${attributeId} was not found.`,
        );
        expect(mockAttributeRepository.findOne).toHaveBeenCalledWith({
          where: { id: attributeId },
        });
        expect(mockAttributeRepository.remove).not.toHaveBeenCalled();
      }
    });

    it('should throw InternalServerErrorException on failed removal', async () => {
      const attributeId: number = 1;

      const found: Attribute = {
        id: attributeId,
        name: 'Color',
        attributeHelicopters: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockAttributeRepository.findOne.mockResolvedValue(found);
      mockAttributeRepository.remove.mockRejectedValue(
        new Error('Failed to remove attribute'),
      );

      try {
        await service.remove(attributeId).toPromise();
      } catch (error) {
        expect(error).toBeInstanceOf(InternalServerErrorException);
        expect(error.message).toBe('Failed to delete attribute');
        expect(mockAttributeRepository.findOne).toHaveBeenCalledWith({
          where: { id: attributeId },
        });
        expect(mockAttributeRepository.remove).toHaveBeenCalledWith(found);
      }
    });
  });
});
