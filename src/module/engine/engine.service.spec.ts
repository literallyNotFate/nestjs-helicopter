import { Test, TestingModule } from '@nestjs/testing';
import { CreateEngineDto, EngineDto, UpdateEngineDto } from './dto';
import { EngineService } from './engine.service';
import { Engine } from './entities/engine.entity';
import { Helicopter } from '../helicopter/entities/helicopter.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { plainToInstance } from 'class-transformer';
import {
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { lastValueFrom, of, throwError } from 'rxjs';
import { AuthService } from '../../core/auth/auth.service';
import { JwtService } from '@nestjs/jwt';
import { UserRepository } from '../user/user.repository';
import { Gender } from '../../common/enums/gender.enum';
import { User } from '../user/entities/user.entity';

describe('EngineService', () => {
  let service: EngineService;
  let authService: AuthService;
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
        EngineService,
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
    authService = module.get<AuthService>(AuthService);
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
      creator: user,
    };

    it('should create a new engine', async () => {
      jest.spyOn(mockEngineRepository, 'create').mockReturnValue(engineResult);
      jest.spyOn(mockEngineRepository, 'save').mockResolvedValue(engineResult);

      jest
        .spyOn(authService, 'getAuthenticatedUser')
        .mockImplementation(() => of(user));

      const observableResult = service.create({ user }, createEngineDto);
      const result = await observableResult.toPromise();

      expect(authService.getAuthenticatedUser).toHaveBeenCalled();
      expect(mockEngineRepository.create).toHaveBeenCalledWith({
        ...createEngineDto,
        creator: user,
      });
      expect(mockEngineRepository.save).toHaveBeenCalledWith(engineResult);
      expect(result).toEqual(plainToInstance(EngineDto, engineResult));
    });

    it('should throw InternalServerErrorException if an error occurs', async () => {
      jest.spyOn(mockEngineRepository, 'create').mockReturnValue(engineResult);
      jest.spyOn(mockEngineRepository, 'save').mockResolvedValue(engineResult);

      jest
        .spyOn(authService, 'getAuthenticatedUser')
        .mockImplementation(() => of(user));

      try {
        await service.create({ user }, createEngineDto);
      } catch (error) {
        expect(error).toBeInstanceOf(InternalServerErrorException);
        expect(error.message).toBe('Failed to create engine.');
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
      creator: user,
    };

    it('should find all engines', async () => {
      const engines = [engineResult];

      jest.spyOn(mockEngineRepository, 'find').mockResolvedValue(engines);

      const find = service.findAll();
      const result = await lastValueFrom(find);

      expect(result).toEqual(plainToInstance(EngineDto, engines));
      expect(mockEngineRepository.find).toHaveBeenCalledWith({
        relations: [
          'helicopters',
          'helicopters.attributeHelicopter',
          'creator',
        ],
      });
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
      creator: user,
    };

    it('should find engine by ID', async () => {
      jest
        .spyOn(mockEngineRepository, 'findOne')
        .mockResolvedValue(engineResult);

      const result = await service.findOne(engineId).toPromise();

      expect(mockEngineRepository.findOne).toHaveBeenCalledWith({
        where: { id: engineId },
        relations: [
          'helicopters',
          'helicopters.attributeHelicopter',
          'creator',
        ],
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
      creator: user,
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
        relations: ['creator'],
      });
      expect(mockEngineRepository.merge).toHaveBeenCalledWith(
        found,
        updateEngineDto,
      );
      expect(mockEngineRepository.save).toHaveBeenCalledWith(updated);
      expect(result).toEqual(plainToInstance(EngineDto, updated));
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
      creator: user,
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
