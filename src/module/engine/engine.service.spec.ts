import { Test, TestingModule } from '@nestjs/testing';
import { EngineService } from './engine.service';
import { Engine } from './entities/engine.entity';
import { Helicopter } from '../helicopter/entities/helicopter.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CreateEngineDto } from './dto/create-engine.dto';
import { plainToInstance } from 'class-transformer';
import { EngineDto } from './dto/engine.dto';
import {
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { lastValueFrom, of, throwError } from 'rxjs';
import { UpdateEngineDto } from './dto/update-engine.dto';

describe('EngineService', () => {
  let service: EngineService;
  let helicopterRepository;
  const REPOSITORY_TOKEN = getRepositoryToken(Engine);

  const mockEngineRepository = {
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
        EngineService,
        {
          provide: REPOSITORY_TOKEN,
          useValue: mockEngineRepository,
        },
        {
          provide: getRepositoryToken(Helicopter),
          useValue: {
            remove: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<EngineService>(EngineService);
    helicopterRepository = module.get(getRepositoryToken(Helicopter));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    const createEngineDto: CreateEngineDto = {
      name: 'Engine',
      year: 2023,
      model: 'Model',
      hp: 500,
    };

    const engineResult: Engine = {
      id: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
      name: 'Engine',
      year: 2023,
      model: 'Model',
      hp: 500,
      helicopters: [],
    };

    it('should create a new engine', async () => {
      jest.spyOn(mockEngineRepository, 'create').mockReturnValue(engineResult);
      jest.spyOn(mockEngineRepository, 'save').mockResolvedValue(engineResult);

      const observableResult = service.create(createEngineDto);
      const result = await observableResult.toPromise();

      expect(mockEngineRepository.create).toHaveBeenCalledWith(createEngineDto);
      expect(mockEngineRepository.save).toHaveBeenCalledWith(engineResult);
      expect(result).toEqual(plainToInstance(EngineDto, engineResult));
    });

    it('should throw InternalServerErrorException if an error occurs', async () => {
      jest.spyOn(mockEngineRepository, 'create').mockReturnValue(engineResult);
      jest.spyOn(mockEngineRepository, 'save').mockResolvedValue(engineResult);

      try {
        await service.create(createEngineDto);
      } catch (error) {
        expect(error).toBeInstanceOf(InternalServerErrorException);
        expect(error.message).toBe('Failed to create attribute.');
      }
    });
  });

  describe('findAll', () => {
    const engineResult: Engine = {
      id: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
      name: 'Engine',
      year: 2023,
      model: 'Model',
      hp: 500,
      helicopters: [],
    };

    it('should find all engines', async () => {
      const engines = [engineResult];

      jest.spyOn(mockEngineRepository, 'find').mockResolvedValue(engines);

      const find = service.findAll();
      const result = await lastValueFrom(find);

      expect(result).toEqual(plainToInstance(EngineDto, engines));
      expect(mockEngineRepository.find).toHaveBeenCalled();
    });

    it('should throw InternalServerErrorException if an error occurs', async () => {
      jest.spyOn(mockEngineRepository, 'find').mockResolvedValue(undefined);

      try {
        await service.findAll();
      } catch (error) {
        expect(error).toBeInstanceOf(InternalServerErrorException);
        expect(error.message).toBe('Failed to get all attributes.');
      }
    });
  });

  describe('findOne', () => {
    const engineId: number = 1;

    const engineResult: Engine = {
      id: engineId,
      createdAt: new Date(),
      updatedAt: new Date(),
      name: 'Engine',
      year: 2023,
      model: 'Model',
      hp: 500,
      helicopters: [],
    };

    it('should find engine by ID', async () => {
      jest
        .spyOn(mockEngineRepository, 'findOne')
        .mockResolvedValue(engineResult);

      const result = await service.findOne(engineId).toPromise();

      expect(mockEngineRepository.findOne).toHaveBeenCalledWith({
        where: { id: engineId },
        relations: ['helicopters', 'helicopters.attributeHelicopter'],
      });

      expect(result).toEqual(plainToInstance(EngineDto, engineResult));
    });

    it('should throw NotFoundException if engine is not found by ID', async () => {
      jest.spyOn(mockEngineRepository, 'findOne').mockReturnValue(of(null));

      try {
        await service.findOne(engineId);
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
        expect(error.message).toBe(`Engine with ID:${engineId} was not found.`);
      }
    });

    it('should throw InternalServerErrorException if an error occurs', async () => {
      jest
        .spyOn(mockEngineRepository, 'findOne')
        .mockReturnValue(throwError(new Error('Database error')));

      try {
        await service.findOne(engineId);
      } catch (error) {
        expect(error).toBeInstanceOf(InternalServerErrorException);
        expect(error.message).toBe('Failed to get engine by ID.');
      }
    });
  });

  describe('update', () => {
    const engineId: number = 1;

    const updateEngineDto: UpdateEngineDto = {
      name: 'edited',
      year: 2020,
      model: 'edited',
      hp: 500,
    };

    const found: Engine = {
      id: engineId,
      createdAt: new Date(),
      updatedAt: new Date(),
      name: 'Engine XYZ',
      year: 2023,
      model: 'Model ABC',
      hp: 300,
      helicopters: [],
    };

    const updated: Engine = {
      ...found,
      name: updateEngineDto.name,
      year: updateEngineDto.year,
      model: updateEngineDto.model,
      hp: updateEngineDto.hp,
      updatedAt: new Date(),
    };

    it('should update an engine', async () => {
      mockEngineRepository.findOne.mockReturnValue(of(found));
      mockEngineRepository.merge.mockReturnValue(updated);
      mockEngineRepository.save.mockReturnValue(of(updated));

      const result = await service
        .update(engineId, updateEngineDto)
        .toPromise();

      expect(mockEngineRepository.findOne).toHaveBeenCalledWith({
        where: { id: engineId },
      });
      expect(mockEngineRepository.merge).toHaveBeenCalledWith(
        found,
        updateEngineDto,
      );
      expect(mockEngineRepository.save).toHaveBeenCalledWith(updated);
      expect(result).toEqual(plainToInstance(EngineDto, updated));
    });

    it('should throw NotFoundException if engine is not found by ID', async () => {
      jest.spyOn(mockEngineRepository, 'findOne').mockResolvedValue(undefined);

      await expect(
        service.update(engineId, updateEngineDto).toPromise(),
      ).rejects.toThrow(NotFoundException);
      expect(mockEngineRepository.findOne).toHaveBeenCalledWith({
        where: { id: engineId },
      });
    });

    it('should throw InternalServerException if an error occurs', async () => {
      jest.spyOn(mockEngineRepository, 'findOne').mockResolvedValue(found);

      try {
        await service.update(engineId, updateEngineDto).toPromise();
      } catch (error) {
        expect(error).toBeInstanceOf(InternalServerErrorException);
        expect(error.message).toBe('Failed to update engine.');
      }
    });
  });

  describe('remove', () => {
    const engineId: number = 1;

    const found: Engine = {
      id: engineId,
      createdAt: new Date(),
      updatedAt: new Date(),
      name: 'Engine XYZ',
      year: 2023,
      model: 'Model ABC',
      hp: 300,
      helicopters: [],
    };

    it('should remove engine', async () => {
      mockEngineRepository.findOne.mockReturnValue(of(found));
      helicopterRepository.remove.mockResolvedValue({});
      mockEngineRepository.remove.mockResolvedValue({});

      await service.remove(engineId).toPromise();

      expect(mockEngineRepository.findOne).toHaveBeenCalledWith({
        where: { id: engineId },
        relations: ['helicopters'],
      });

      expect(helicopterRepository.remove).toHaveBeenCalledWith(
        found.helicopters,
      );
      expect(mockEngineRepository.remove).toHaveBeenCalledWith(found);
    });

    it('should throw NotFoundException if engine is not found by ID', async () => {
      const engineId: number = 1;
      mockEngineRepository.findOne.mockResolvedValue(null);

      await expect(service.remove(engineId).toPromise()).rejects.toThrow(
        NotFoundException,
      );

      expect(mockEngineRepository.findOne).toHaveBeenCalledWith({
        where: { id: engineId },
        relations: ['helicopters'],
      });
    });

    it('should throw InternalServerErrorException if an error occurs', async () => {
      mockEngineRepository.findOne.mockResolvedValue(found);
      helicopterRepository.remove.mockResolvedValue({});
      mockEngineRepository.remove.mockRejectedValue(new Error());

      try {
        await service.remove(engineId).toPromise();
      } catch (error) {
        expect(error).toBeInstanceOf(InternalServerErrorException);
        expect(error.message).toBe('Failed to delete engine or helicopters.');

        expect(mockEngineRepository.findOne).toHaveBeenCalledWith({
          where: { id: engineId },
          relations: ['helicopters'],
        });
        expect(helicopterRepository.remove).toHaveBeenCalledWith(
          found.helicopters,
        );
        expect(mockEngineRepository.remove).toHaveBeenCalledWith(found);
      }
    });
  });
});
