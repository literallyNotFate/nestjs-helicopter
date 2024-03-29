import { AttributeHelicopter } from './../attribute-helicopter/entities/attribute-helicopter.entity';
import { UserDto } from '../../module/user/dto';
import { plainToInstance } from 'class-transformer';
import { Test, TestingModule } from '@nestjs/testing';
import { HelicopterService } from './helicopter.service';
import { Helicopter } from './entities/helicopter.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Engine } from '../engine/entities/engine.entity';
import {
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { of } from 'rxjs';
import { HelicopterDto, UpdateHelicopterDto, CreateHelicopterDto } from './dto';
import { EngineDto } from '../engine/dto';
import {
  AttributeHelicopterResponseDto,
  AttributeHelicopterDto,
} from '../attribute-helicopter/dto';
import { User } from '../user/entities/user.entity';
import { Gender } from '../../common/enums/gender.enum';
import { AuthService } from '../../core/auth/auth.service';
import { UserRepository } from '../user/user.repository';
import { JwtService } from '@nestjs/jwt';

describe('HelicopterService', () => {
  let service: HelicopterService;
  let authService: AuthService;
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
        HelicopterService,
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
    authService = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    const attributeHelicopterId: number = 1;
    const engineId: number = 1;

    const createHelicopterDto: CreateHelicopterDto = {
      model: 'ABC-1101',
      year: 2023,
      engineId,
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
        creator: plainToInstance(UserDto, user),
      },
      creator: plainToInstance(UserDto, user),
    };

    const foundEngine: EngineDto = {
      id: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
      name: 'Engine XYZ',
      year: 2023,
      model: 'Model ABC',
      hp: 300,
      helicopters: [],
      creator: plainToInstance(UserDto, user),
    };

    const createdHelicopter: HelicopterDto = {
      id: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
      model: 'ABC-1101',
      year: 2023,
      engineId: 1,
      engine: foundEngine,
      attributeHelicopterId: 1,
      attributeHelicopter: {
        id: attributeHelicopterId,
        createdAt: foundAttributeHelicopter.createdAt,
        updatedAt: foundAttributeHelicopter.updatedAt,
        helicopters: [],
        attributes: [],
        creator: plainToInstance(UserDto, user),
      },
      creator: plainToInstance(UserDto, user),
    };

    it('should create a new helicopter', async () => {
      attributeHelicopterRepository.findOne.mockResolvedValue(
        foundAttributeHelicopter,
      );
      engineRepository.findOne.mockResolvedValue(foundEngine);

      jest
        .spyOn(authService, 'getAuthenticatedUser')
        .mockImplementation(() => of(user));

      mockHelicopterRepository.save.mockResolvedValue(createdHelicopter);

      const result = await service
        .create({ user }, createHelicopterDto)
        .toPromise();

      const { attributeHelicopterId, engineId, ...rest } = createHelicopterDto;

      expect(mockHelicopterRepository.create).toHaveBeenCalledWith({
        ...rest,
        attributeHelicopter: foundAttributeHelicopter,
        engine: foundEngine,
        creator: user,
      });

      expect(result).toMatchObject(createdHelicopter);

      expect(attributeHelicopterRepository.findOne).toHaveBeenCalledWith({
        where: { id: attributeHelicopterId },
        relations: ['attributes', 'creator'],
      });

      expect(engineRepository.findOne).toHaveBeenCalledWith({
        where: { id: engineId },
        relations: ['creator'],
      });

      expect(authService.getAuthenticatedUser).toHaveBeenCalled();
    });

    it('should throw NotFoundException if attribute helicopter is not found by ID', async () => {
      attributeHelicopterRepository.findOne.mockResolvedValue(of(null));
      engineRepository.findOne.mockResolvedValue(foundEngine);
      jest
        .spyOn(authService, 'getAuthenticatedUser')
        .mockImplementation(() => of(user));

      try {
        await service.create({ user }, createHelicopterDto).toPromise();
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
        expect(error.message).toBe(
          `AttributeHelicopter with ID:${attributeHelicopterId} was not found.`,
        );
      }
    });

    it('should throw NotFoundException if engine is not found by ID', async () => {
      attributeHelicopterRepository.findOne.mockResolvedValue(
        foundAttributeHelicopter,
      );
      engineRepository.findOne.mockResolvedValue(of(null));
      jest
        .spyOn(authService, 'getAuthenticatedUser')
        .mockImplementation(() => of(user));

      try {
        await service.create({ user }, createHelicopterDto).toPromise();
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
        expect(error.message).toBe(`Engine with ID:${engineId} was not found.`);
      }
    });

    it('should throw InternalServerErrorException if an error occurs', async () => {
      attributeHelicopterRepository.findOne.mockResolvedValue(
        foundAttributeHelicopter,
      );
      engineRepository.findOne.mockResolvedValue(foundEngine);

      jest
        .spyOn(authService, 'getAuthenticatedUser')
        .mockImplementation(() => of(user));

      mockHelicopterRepository.save.mockResolvedValue(createdHelicopter);
      try {
        await await service.create({ user }, createHelicopterDto).toPromise();
      } catch (error) {
        expect(error).toBeInstanceOf(InternalServerErrorException);
        expect(error.message).toBe('Failed to create helicopter.');
      }

      expect(attributeHelicopterRepository.findOne).toHaveBeenCalledWith({
        where: { id: attributeHelicopterId },
        relations: ['attributes', 'creator'],
      });

      expect(engineRepository.findOne).toHaveBeenCalledWith({
        where: { id: engineId },
        relations: ['creator'],
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
        creator: user,
      },
      creator: user,
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
        creator: plainToInstance(UserDto, user),
      },
      attributeHelicopterId,
      attributeHelicopter: {
        id: attributeHelicopterId,
        createdAt: attributeHelicopter.createdAt,
        updatedAt: attributeHelicopter.updatedAt,
        attributes: [],
        helicopters: [],
        creator: plainToInstance(UserDto, user),
      },
      creator: plainToInstance(UserDto, user),
    };

    const helicopters = [helicopter];

    it('should find all helicopters', async () => {
      jest
        .spyOn(mockHelicopterRepository, 'find')
        .mockReturnValue(of(helicopters));

      jest
        .spyOn(attributeHelicopterRepository, 'findOne')
        .mockReturnValue(of(attributeHelicopter));

      const result = await service.findAll().toPromise();

      expect(result).toMatchObject(helicopters);
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

  describe('findAllByCreator', () => {
    const email: string = user.email;
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
        creator: user,
      },
      creator: user,
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
        creator: plainToInstance(UserDto, user),
      },
      attributeHelicopterId,
      attributeHelicopter: {
        id: attributeHelicopterId,
        createdAt: attributeHelicopter.createdAt,
        updatedAt: attributeHelicopter.updatedAt,
        attributes: [],
        helicopters: [],
        creator: plainToInstance(UserDto, user),
      },
      creator: plainToInstance(UserDto, user),
    };

    const helicopters = [helicopter];

    it('should find all helicopters of a creator', async () => {
      jest
        .spyOn(mockHelicopterRepository, 'find')
        .mockReturnValue(of(helicopters));

      jest
        .spyOn(attributeHelicopterRepository, 'findOne')
        .mockReturnValue(of(attributeHelicopter));

      const result = await service.findAllByCreator(email).toPromise();

      expect(result).toMatchObject(helicopters);
    });

    it('should throw InternalServerErrorException if an error occurs', async () => {
      jest.spyOn(mockHelicopterRepository, 'find').mockResolvedValue(undefined);

      try {
        await service.findAllByCreator(email);
      } catch (error) {
        expect(error).toBeInstanceOf(InternalServerErrorException);
        expect(error.message).toBe(
          'Failed to get all helicopters of a creator.',
        );
      }
    });
  });

  describe('findOne', () => {
    const helicopterId: number = 1;
    const engineId: number = 1;
    const attributeHelicopterId: number = 1;

    const engine: EngineDto = {
      id: engineId,
      createdAt: new Date(),
      updatedAt: new Date(),
      name: 'Engine XYZ',
      year: 2023,
      model: 'Model ABC',
      hp: 300,
      helicopters: [],
      creator: plainToInstance(UserDto, user),
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
        creator: plainToInstance(UserDto, user),
      },
      creator: plainToInstance(UserDto, user),
    };

    const helicopter: HelicopterDto = {
      id: helicopterId,
      createdAt: new Date(),
      updatedAt: new Date(),
      model: 'ABC-1101',
      year: 2023,
      engineId: engineId,
      engine: engine,
      attributeHelicopterId: attributeHelicopterId,
      attributeHelicopter: {
        id: attributeHelicopterId,
        createdAt: attributeHelicopter.createdAt,
        updatedAt: attributeHelicopter.updatedAt,
        helicopters: [],
        attributes: [],
        creator: plainToInstance(UserDto, user),
      },
      creator: plainToInstance(UserDto, user),
    };

    it('should find helicopter by ID', async () => {
      mockHelicopterRepository.findOne.mockResolvedValue(helicopter);
      attributeHelicopterRepository.findOne.mockResolvedValue(
        attributeHelicopter,
      );

      const result = await service.findOne(helicopterId).toPromise();

      expect(result).toMatchObject(helicopter);

      expect(mockHelicopterRepository.findOne).toHaveBeenCalledWith({
        where: { id: helicopterId },
        relations: ['creator'],
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
        relations: ['creator'],
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
      creator: plainToInstance(UserDto, user),
    };

    const foundAttributeHelicopter: AttributeHelicopterResponseDto = {
      id: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
      helicopters: [],
      attributes: [],
      creator: plainToInstance(UserDto, user),
    };

    const foundHelicopter: HelicopterDto = {
      id: helicopterId,
      createdAt: new Date(),
      updatedAt: new Date(),
      model: 'ABC-1101',
      year: 2023,
      engineId: 1,
      engine: foundEngine,
      attributeHelicopterId: foundAttributeHelicopter.id,
      attributeHelicopter: foundAttributeHelicopter,
      creator: plainToInstance(UserDto, user),
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
        creator: plainToInstance(UserDto, user),
      },
      attributeHelicopterId: updateHelicopterDto.attributeHelicopterId,
      attributeHelicopter: {
        id: updateHelicopterDto.attributeHelicopterId,
        createdAt: foundAttributeHelicopter.createdAt,
        updatedAt: foundAttributeHelicopter.updatedAt,
        helicopters: [],
        attributes: [],
        creator: plainToInstance(UserDto, user),
      },
      creator: plainToInstance(UserDto, user),
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

    const foundAttributeHelicopter: AttributeHelicopterResponseDto = {
      id: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
      helicopters: [],
      attributes: [],
      creator: plainToInstance(UserDto, user),
    };

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
        creator: plainToInstance(UserDto, user),
      },
      attributeHelicopterId: 1,
      attributeHelicopter: foundAttributeHelicopter,
      creator: plainToInstance(UserDto, user),
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
