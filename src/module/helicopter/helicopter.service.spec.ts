import { Test, TestingModule } from '@nestjs/testing';
import { HelicopterService } from './helicopter.service';
import { Helicopter } from './entities/helicopter.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Engine } from '../engine/entities/engine.entity';
import { AttributeHelicopter } from '../attribute-helicopter/entities/attribute-helicopter.entity';
import { CreateHelicopterDto } from './dto/create-helicopter.dto';
import { HelicopterDto } from './dto/helicopter.dto';
import { AttributeHelicopterDto } from '../attribute-helicopter/dto/attribute-helicopter.dto';
import {
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { of } from 'rxjs';
import { UpdateHelicopterDto } from './dto/update-helicopter.dto';
import { EngineDto } from '../engine/dto/engine.dto';
import { AttributeHelicopterResponseDto } from '../attribute-helicopter/dto/attribute-helicopter-response.dto';

describe('HelicopterService', () => {
  let service: HelicopterService;
  const REPOSITORY_TOKEN = getRepositoryToken(Helicopter);

  let engineRepository;
  let attributeHelicopterRepository;

  const mockHelicopterRepository = {
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
        HelicopterService,
        {
          provide: REPOSITORY_TOKEN,
          useValue: mockHelicopterRepository,
        },
        {
          provide: getRepositoryToken(Engine),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            find: jest.fn(),
            findOne: jest.fn(),
            remove: jest.fn(),
            merge: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(AttributeHelicopter),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            find: jest.fn(),
            findOne: jest.fn(),
            remove: jest.fn(),
            merge: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<HelicopterService>(HelicopterService);
    engineRepository = module.get(getRepositoryToken(Engine));
    attributeHelicopterRepository = module.get(
      getRepositoryToken(AttributeHelicopter),
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    const attributeHelicopterId: number = 1;

    const createHelicopterDto: CreateHelicopterDto = {
      model: 'ABC-1101',
      year: 2023,
      engineId: 1,
      attributeHelicopterId,
    };

    const foundAttributeHelicopter: AttributeHelicopterDto = {
      id: attributeHelicopterId,
      createdAt: new Date(),
      updatedAt: new Date(),
      value: '',
      attributeId: 1,
      attribute: {
        id: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
        name: 'Attribute',
        helicopters: [],
      },
    };

    const createdHelicopter: HelicopterDto = {
      id: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
      model: 'ABC-1101',
      year: 2023,
      engineId: 1,
      engine: {
        id: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
        name: 'Engine XYZ',
        year: 2023,
        model: 'Model ABC',
        hp: 300,
        helicopters: [],
      },
      attributeHelicopterId: 1,
      attributeHelicopter: {
        id: attributeHelicopterId,
        createdAt: new Date(),
        updatedAt: new Date(),
        helicopters: [],
        attributes: [],
      },
    };

    it('should create a new helicopter', async () => {
      attributeHelicopterRepository.findOne.mockResolvedValue(
        foundAttributeHelicopter,
      );

      mockHelicopterRepository.save.mockResolvedValue(createdHelicopter);

      // expect(mockHelicopterRepository.save).toHaveBeenCalledWith(
      //   createdHelicopter,
      // );

      const result = await service.create(createHelicopterDto).toPromise();

      expect(result).toMatchObject(createdHelicopter);

      expect(attributeHelicopterRepository.findOne).toHaveBeenCalledWith({
        where: { id: attributeHelicopterId },
        relations: ['attributes'],
      });
    });

    it('should throw NotFoundException if attribute helicopter is not found by ID', async () => {
      attributeHelicopterRepository.findOne.mockResolvedValue(of(null));

      try {
        await service.create(createHelicopterDto).toPromise();
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
        expect(error.message).toBe(
          `AttributeHelicopter with ID:${attributeHelicopterId} was not found.`,
        );
      }
    });

    it('should throw InternalServerErrorException if an error occurs', async () => {
      attributeHelicopterRepository.findOne.mockResolvedValue(
        foundAttributeHelicopter,
      );

      mockHelicopterRepository.save.mockResolvedValue(createdHelicopter);
      try {
        await await service.create(createHelicopterDto).toPromise();
      } catch (error) {
        expect(error).toBeInstanceOf(InternalServerErrorException);
        expect(error.message).toBe('Failed to create helicopter.');
      }

      expect(attributeHelicopterRepository.findOne).toHaveBeenCalledWith({
        where: { id: attributeHelicopterId },
        relations: ['attributes'],
      });
    });
  });

  describe('findAll', () => {
    const attributeHelicopterId: number = 1;

    const attributeHelicopter = {
      id: attributeHelicopterId,
      createdAt: new Date(),
      updatedAt: new Date(),
      value: '',
      attributeId: 1,
      attribute: {
        id: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
        name: 'Attribute',
        helicopters: [],
      },
    };

    const helicopter: HelicopterDto = {
      id: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
      model: 'ABC-1101',
      year: 2023,
      engineId: 1,
      engine: {
        id: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
        name: 'Engine XYZ',
        year: 2023,
        model: 'Model ABC',
        hp: 300,
        helicopters: [],
      },
      attributeHelicopterId: 1,
      attributeHelicopter: {
        id: attributeHelicopterId,
        createdAt: new Date(),
        updatedAt: new Date(),
        helicopters: [],
        attributes: [],
      },
    };

    it('should find all helicopters', async () => {
      const helicopters = [helicopter];

      jest
        .spyOn(mockHelicopterRepository, 'find')
        .mockReturnValue(of(helicopters));

      jest
        .spyOn(attributeHelicopterRepository, 'findOne')
        .mockReturnValue(of(attributeHelicopter));

      const result = await service.findAll().toPromise();

      expect(result).toEqual(helicopters);
    });

    it('should throw InternalServerErrorException if an error occurs', async () => {
      jest.spyOn(mockHelicopterRepository, 'find').mockResolvedValue(undefined);

      try {
        await service.findAll();
      } catch (error) {
        expect(error).toBeInstanceOf(InternalServerErrorException);
        expect(error.message).toBe('Failed to get all helicopters.');
      }
    });
  });

  describe('findOne', () => {
    const helicopterId: number = 1;
    const attributeHelicopterId: number = 1;

    const helicopter: HelicopterDto = {
      id: helicopterId,
      createdAt: new Date(),
      updatedAt: new Date(),
      model: 'ABC-1101',
      year: 2023,
      engineId: 1,
      engine: {
        id: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
        name: 'Engine XYZ',
        year: 2023,
        model: 'Model ABC',
        hp: 300,
        helicopters: [],
      },
      attributeHelicopterId: attributeHelicopterId,
      attributeHelicopter: {
        id: attributeHelicopterId,
        createdAt: new Date(),
        updatedAt: new Date(),
        helicopters: [],
        attributes: [],
      },
    };

    const attributeHelicopter: AttributeHelicopterDto = {
      id: attributeHelicopterId,
      createdAt: new Date(),
      updatedAt: new Date(),
      value: '',
      attributeId: 1,
      attribute: {
        id: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
        name: 'Attribute',
        helicopters: [],
      },
    };

    it('should find helicopter by ID', async () => {
      mockHelicopterRepository.findOne.mockResolvedValue(helicopter);
      attributeHelicopterRepository.findOne.mockResolvedValue(
        attributeHelicopter,
      );

      const result = await service.findOne(helicopterId).toPromise();

      expect(result).toEqual(helicopter);

      expect(mockHelicopterRepository.findOne).toHaveBeenCalledWith({
        where: { id: helicopterId },
      });

      expect(attributeHelicopterRepository.findOne).toHaveBeenCalledWith({
        where: { id: attributeHelicopterId },
        relations: ['attributes'],
      });
    });

    it('should throw NotFoundException if helicopter is not found by ID', async () => {
      jest.spyOn(mockHelicopterRepository, 'findOne').mockReturnValue(of(null));

      try {
        await service.findOne(helicopterId);
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
        expect(error.message).toBe(
          `Helicopter with ID:${helicopterId} was not found.`,
        );
      }
    });

    it('should throw InternalServerErrorException if an error occurs', async () => {
      mockHelicopterRepository.findOne.mockRejectedValue(new Error());

      await expect(service.findOne(helicopterId).toPromise()).rejects.toThrow(
        InternalServerErrorException,
      );

      expect(mockHelicopterRepository.findOne).toHaveBeenCalledWith({
        where: { id: helicopterId },
      });
    });
  });

  describe('update', () => {
    const helicopterId: number = 1;
    const engineId: number = 2;
    const attributeHelicopterId: number = 2;

    const updateHelicopterDto: UpdateHelicopterDto = {
      model: 'edit',
      year: 2020,
      engineId,
      attributeHelicopterId,
    };

    const foundEngine: EngineDto = {
      id: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
      name: 'Engine',
      year: 2023,
      model: 'Model',
      hp: 300,
      helicopters: [],
    };

    const foundAttributeHelicopter: AttributeHelicopterResponseDto = {
      id: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
      helicopters: [],
      attributes: [],
    };

    const foundHelicopter: HelicopterDto = {
      id: helicopterId,
      createdAt: new Date(),
      updatedAt: new Date(),
      model: 'ABC-1101',
      year: 2023,
      engineId: 1,
      engine: foundEngine,
      attributeHelicopterId: 1,
      attributeHelicopter: foundAttributeHelicopter,
    };

    const updatedHelicopter: HelicopterDto = {
      id: foundHelicopter.id,
      createdAt: foundHelicopter.createdAt,
      updatedAt: new Date(),
      model: updateHelicopterDto.model,
      year: updateHelicopterDto.year,
      engineId: updateHelicopterDto.engineId,
      engine: {
        id: engineId,
        createdAt: new Date(),
        updatedAt: new Date(),
        name: 'Engine 2',
        year: 2020,
        model: 'Model 2',
        hp: 500,
        helicopters: [],
      },
      attributeHelicopterId: updateHelicopterDto.attributeHelicopterId,
      attributeHelicopter: {
        id: updateHelicopterDto.attributeHelicopterId,
        createdAt: new Date(),
        updatedAt: new Date(),
        helicopters: [],
        attributes: [],
      },
    };

    it('should update a helicopter', async () => {
      mockHelicopterRepository.findOne.mockResolvedValue(foundHelicopter);
      engineRepository.findOne.mockResolvedValue(foundEngine);
      attributeHelicopterRepository.findOne.mockResolvedValue(
        foundAttributeHelicopter,
      );
      mockHelicopterRepository.save.mockResolvedValue(updatedHelicopter);

      const result = await service
        .update(helicopterId, updateHelicopterDto)
        .toPromise();

      expect(result).toMatchObject(updatedHelicopter);

      expect(mockHelicopterRepository.findOne).toHaveBeenCalledWith({
        where: { id: helicopterId },
        relations: ['engine', 'attributeHelicopter'],
      });

      expect(engineRepository.findOne).toHaveBeenCalledWith({
        where: { id: updateHelicopterDto.engineId },
      });

      expect(attributeHelicopterRepository.findOne).toHaveBeenCalledWith({
        where: { id: updateHelicopterDto.attributeHelicopterId },
        relations: ['attributes'],
      });

      expect(mockHelicopterRepository.save).toHaveBeenCalledWith(
        foundHelicopter,
      );
    });

    it('should throw NotFoundException if helicopter is not found by ID', async () => {
      jest
        .spyOn(mockHelicopterRepository, 'findOne')
        .mockResolvedValue(undefined);

      try {
        await service.update(helicopterId, updateHelicopterDto).toPromise();
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
        expect(error.message).toBe(
          `Helicopter with ID:${helicopterId} was not found.`,
        );
      }

      expect(mockHelicopterRepository.findOne).toHaveBeenCalledWith({
        where: { id: helicopterId },
        relations: ['engine', 'attributeHelicopter'],
      });
    });

    it('should throw NotFoundException if engine is not found by ID', async () => {
      jest
        .spyOn(mockHelicopterRepository, 'findOne')
        .mockResolvedValue(foundHelicopter);

      jest.spyOn(engineRepository, 'findOne').mockResolvedValue(null);

      try {
        await service.update(helicopterId, updateHelicopterDto);
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
        expect(error.message).toBe(
          `Engine with ID:${updateHelicopterDto.engineId} was not found.`,
        );

        expect(engineRepository.findOne).toHaveBeenCalledWith({
          where: { id: updateHelicopterDto.engineId },
        });
      }

      expect(mockHelicopterRepository.findOne).toHaveBeenCalledWith({
        where: { id: helicopterId },
        relations: ['engine', 'attributeHelicopter'],
      });
    });

    it('should throw NotFoundException if attribute helicopter is not found by ID', async () => {
      jest
        .spyOn(mockHelicopterRepository, 'findOne')
        .mockResolvedValue(foundHelicopter);

      jest.spyOn(engineRepository, 'findOne').mockResolvedValue(foundEngine);
      jest
        .spyOn(attributeHelicopterRepository, 'findOne')
        .mockResolvedValue(null);

      try {
        await service.update(helicopterId, updateHelicopterDto);
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
        expect(error.message).toBe(
          `AttributeHelicopter with ID:${updateHelicopterDto.attributeHelicopterId} was not found.`,
        );

        expect(mockHelicopterRepository.findOne).toHaveBeenCalledWith({
          where: { id: helicopterId },
          relations: ['engine', 'attributeHelicopter'],
        });

        expect(engineRepository.findOne).toHaveBeenCalledWith({
          where: { id: engineId },
        });

        expect(attributeHelicopterRepository.findOne).toHaveBeenCalledWith({
          where: { id: updateHelicopterDto.attributeHelicopterId },
          relations: ['attributes'],
        });
      }
    });

    it('should throw InternalServerErrorException if an error occurs', async () => {
      jest
        .spyOn(mockHelicopterRepository, 'findOne')
        .mockResolvedValue(foundHelicopter);

      jest.spyOn(engineRepository, 'findOne').mockResolvedValue(foundEngine);

      jest
        .spyOn(attributeHelicopterRepository, 'findOne')
        .mockResolvedValue(foundAttributeHelicopter);

      jest
        .spyOn(mockHelicopterRepository, 'save')
        .mockRejectedValue(new Error());

      try {
        await service.update(helicopterId, updateHelicopterDto);
      } catch (error) {
        expect(error).toBeInstanceOf(InternalServerErrorException);
        expect(error.message).toBe('Failed to update helicopter.');

        expect(mockHelicopterRepository.findOne).toHaveBeenCalledWith({
          where: { id: helicopterId },
          relations: ['engine', 'attributeHelicopter'],
        });

        expect(engineRepository.findOne).toHaveBeenCalledWith({
          where: { id: engineId },
        });

        expect(attributeHelicopterRepository.findOne).toHaveBeenCalledWith({
          where: { id: updateHelicopterDto.attributeHelicopterId },
          relations: ['attributes'],
        });
      }
    });
  });

  describe('remove', () => {
    const helicopterId: number = 1;

    const foundHelicopter: HelicopterDto = {
      id: helicopterId,
      createdAt: new Date(),
      updatedAt: new Date(),
      model: 'ABC-1101',
      year: 2023,
      engineId: 1,
      engine: {
        id: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
        name: 'Engine XYZ',
        year: 2023,
        model: 'Model ABC',
        hp: 300,
        helicopters: [],
      },
      attributeHelicopterId: 1,
      attributeHelicopter: {
        id: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
        helicopters: [],
        attributes: [],
      },
    };

    it('should remove helicopter', async () => {
      jest
        .spyOn(mockHelicopterRepository, 'findOne')
        .mockResolvedValue(foundHelicopter);
      jest.spyOn(mockHelicopterRepository, 'remove').mockResolvedValue({});

      await service.remove(helicopterId).toPromise();

      expect(mockHelicopterRepository.findOne).toHaveBeenCalledWith({
        where: { id: helicopterId },
      });

      expect(mockHelicopterRepository.remove).toHaveBeenCalledWith(
        foundHelicopter,
      );
    });

    it('should throw NotFoundException if helicopter is not found by ID', async () => {
      mockHelicopterRepository.findOne.mockResolvedValue(null);

      await expect(service.remove(helicopterId).toPromise()).rejects.toThrow(
        NotFoundException,
      );

      expect(mockHelicopterRepository.findOne).toHaveBeenCalledWith({
        where: { id: helicopterId },
      });
    });

    it('should throw InternalServerErrorException if an error occurs', async () => {
      mockHelicopterRepository.findOne.mockResolvedValue(foundHelicopter);
      mockHelicopterRepository.remove.mockResolvedValue({});
      mockHelicopterRepository.remove.mockRejectedValue(new Error());

      try {
        await service.remove(helicopterId).toPromise();
      } catch (error) {
        expect(error).toBeInstanceOf(InternalServerErrorException);
        expect(error.message).toBe('Failed to delete helicopter.');

        expect(mockHelicopterRepository.findOne).toHaveBeenCalledWith({
          where: { id: helicopterId },
        });

        expect(mockHelicopterRepository.remove).toHaveBeenCalledWith(
          foundHelicopter,
        );
      }
    });
  });
});
