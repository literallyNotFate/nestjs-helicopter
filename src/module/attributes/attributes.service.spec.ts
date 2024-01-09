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
import { User } from '../user/entities/user.entity';
import { Gender } from '../../common/enums/gender.enum';
import { AuthService } from '../../core/auth/auth.service';
import { JwtService } from '@nestjs/jwt';
import { UserRepository } from '../user/user.repository';

describe('AttributesService', () => {
  let service: AttributesService;
  let authService: AuthService;
  const REPOSITORY_TOKEN = getRepositoryToken(Attribute);

  const mockAttributeRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
    merge: jest.fn(),
  };

  const user: User = {
    id: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
    firstName: 'data',
    lastName: 'data',
    email: 'data@gmail.com',
    password: '$3124R$fv.xfsf',
    gender: Gender.FEMALE,
    phoneNumber: '12345',
    attributes: [],
    helicopters: [],
    attributeHelicopters: [],
    engines: [],
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AttributesService,
        AuthService,
        {
          provide: JwtService,
          useValue: {
            signAsync: jest.fn(),
            verify: jest.fn(),
          },
        },
        {
          provide: UserRepository,
          useValue: {
            getByEmail: jest.fn(),
          },
        },
        {
          provide: REPOSITORY_TOKEN,
          useValue: mockAttributeRepository,
        },
      ],
    }).compile();

    service = module.get<AttributesService>(AttributesService);
    authService = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    const createAttributeDto: CreateAttributeDto = {
      name: 'Color',
    };

    const attributeResult: Attribute = {
      id: 1,
      name: 'Color',
      attributeHelicopters: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      creator: user,
    };

    it('should create an attribute', async () => {
      jest
        .spyOn(mockAttributeRepository, 'create')
        .mockReturnValue(attributeResult);
      jest
        .spyOn(mockAttributeRepository, 'save')
        .mockReturnValue(of(attributeResult));

      jest
        .spyOn(authService, 'getAuthenticatedUser')
        .mockImplementation(() => of(user));

      const observableResult = service.create({ user }, createAttributeDto);
      const result = await observableResult.toPromise();

      expect(authService.getAuthenticatedUser).toHaveBeenCalled();
      expect(mockAttributeRepository.create).toHaveBeenCalledWith({
        ...createAttributeDto,
        creator: user,
      });
      expect(mockAttributeRepository.save).toHaveBeenCalledWith(
        attributeResult,
      );
      expect(result).toEqual(plainToInstance(AttributesDto, attributeResult));
    });

    it('should throw InternalServerErrorException if an error occurs', async () => {
      jest
        .spyOn(mockAttributeRepository, 'create')
        .mockReturnValue(attributeResult);
      jest
        .spyOn(mockAttributeRepository, 'save')
        .mockReturnValue(throwError(new Error('Database error')));

      jest
        .spyOn(authService, 'getAuthenticatedUser')
        .mockImplementation(() => of(user));

      try {
        await service.create({ user }, createAttributeDto);
      } catch (error) {
        expect(error).toBeInstanceOf(InternalServerErrorException);
        expect(error.message).toBe('Failed to create attribute.');
      }
    });
  });

  describe('findAll', () => {
    const attributeResult: Attribute = {
      id: 1,
      name: 'Color',
      attributeHelicopters: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      creator: user,
    };

    it('should find all attributes', async () => {
      const attributes = [attributeResult];

      jest
        .spyOn(mockAttributeRepository, 'find')
        .mockReturnValue(of(attributes));

      const find = service.findAll();
      const result = await lastValueFrom(find);

      expect(result).toEqual(plainToInstance(AttributesDto, attributes));
      expect(mockAttributeRepository.find).toHaveBeenCalledWith({
        relations: ['creator'],
      });
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
    const attributeId: number = 1;

    const attributeResult: Attribute = {
      id: attributeId,
      name: 'Color',
      attributeHelicopters: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      creator: user,
    };

    it('should find attribute by ID', async () => {
      jest
        .spyOn(mockAttributeRepository, 'findOne')
        .mockReturnValue(of(attributeResult));

      const find = service.findOne(attributeId);
      const result = await lastValueFrom(find);

      expect(mockAttributeRepository.findOne).toHaveBeenCalledWith({
        where: { id: attributeId },
        relations: ['creator'],
      });
      expect(result).toEqual(plainToInstance(AttributesDto, attributeResult));
    });

    it('should throw NotFoundException if attribute is not found by ID', async () => {
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
    const attributeId: number = 1;
    const updateAttributeDto: UpdateAttributeDto = {
      name: 'edited',
    };

    const found: Attribute = {
      id: attributeId,
      name: 'Color',
      attributeHelicopters: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      creator: user,
    };

    const updated: Attribute = {
      ...found,
      name: updateAttributeDto.name,
      updatedAt: new Date(),
    };

    it('should update an attribute', async () => {
      mockAttributeRepository.findOne.mockReturnValue(of(found));
      mockAttributeRepository.merge.mockReturnValue(updated);
      mockAttributeRepository.save.mockReturnValue(of(updated));

      const result = await service
        .update(attributeId, updateAttributeDto)
        .toPromise();

      expect(mockAttributeRepository.findOne).toHaveBeenCalledWith({
        where: { id: attributeId },
        relations: ['creator'],
      });

      expect(mockAttributeRepository.merge).toHaveBeenCalledWith(
        found,
        updateAttributeDto,
      );

      expect(mockAttributeRepository.save).toHaveBeenCalledWith(updated);
      expect(result).toEqual(plainToInstance(AttributesDto, updated));
    });

    it('should throw NotFoundException if attribute is not found by ID', async () => {
      jest
        .spyOn(mockAttributeRepository, 'findOne')
        .mockResolvedValue(undefined);

      await expect(
        service.update(attributeId, updateAttributeDto).toPromise(),
      ).rejects.toThrow(NotFoundException);

      expect(mockAttributeRepository.findOne).toHaveBeenCalledWith({
        where: { id: attributeId },
        relations: ['creator'],
      });

      expect(mockAttributeRepository.merge).not.toHaveBeenCalled();
      expect(mockAttributeRepository.save).not.toHaveBeenCalled();
    });

    it('should throw InternalServerErrorException if an error occurs', async () => {
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
    const attributeId: number = 1;

    const found: Attribute = {
      id: attributeId,
      name: 'Color',
      attributeHelicopters: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      creator: user,
    };

    it('should remove attribute', async () => {
      mockAttributeRepository.findOne.mockResolvedValue(found);
      mockAttributeRepository.remove.mockResolvedValue(found);

      await service.remove(attributeId).toPromise();

      expect(mockAttributeRepository.findOne).toHaveBeenCalledWith({
        where: { id: attributeId },
      });
      expect(mockAttributeRepository.remove).toHaveBeenCalledWith(found);
    });

    it('should throw NotFoundException if attribute is not found by ID', async () => {
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

    it('should throw InternalServerErrorException if an error occurs', async () => {
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
