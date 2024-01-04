import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Helicopter } from '../helicopter/entities/helicopter.entity';
import { Engine } from '../engine/entities/engine.entity';
import { Attribute } from '../attributes/entities/attribute.entity';
import { AttributeHelicopter } from '../attribute-helicopter/entities/attribute-helicopter.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { Gender } from '../../common/enums/gender.enum';
import { UserDto } from './dto/user.dto';
import { of, throwError } from 'rxjs';
import * as bcrypt from 'bcrypt';
import {
  BadRequestException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { UpdateUserDto } from './dto/update-user.dto';
import { HelicopterDto } from '../helicopter/dto/helicopter.dto';
import { EngineDto } from '../engine/dto/engine.dto';
import { AttributeHelicopterResponseDto } from '../attribute-helicopter/dto/attribute-helicopter-response.dto';
import { AttributesDto } from '../attributes/dto/attributes.dto';

describe('UserService', () => {
  let service: UserService;
  const REPOSITORY_TOKEN = getRepositoryToken(User);

  const mockUserRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
    merge: jest.fn(),
  };

  let helicopterRepository,
    attributeRepository,
    engineRepository,
    attributeHelicopterRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: REPOSITORY_TOKEN,
          useValue: mockUserRepository,
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
          },
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
          provide: getRepositoryToken(Attribute),
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

    service = module.get<UserService>(UserService);
    helicopterRepository = module.get(getRepositoryToken(Helicopter));
    attributeRepository = module.get(getRepositoryToken(Attribute));
    engineRepository = module.get(getRepositoryToken(Engine));
    attributeHelicopterRepository = module.get(
      getRepositoryToken(AttributeHelicopter),
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    const hashed: string = 'hashed';

    const createUserDto: CreateUserDto = {
      firstName: 'First',
      lastName: 'Last',
      email: 'some@email.com',
      password: '11223344',
      gender: Gender.MALE,
      phoneNumber: '+3736923245',
    };

    const createdUser: UserDto = {
      id: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
      firstName: createUserDto.firstName,
      lastName: createUserDto.lastName,
      email: createUserDto.email,
      password: hashed,
      gender: createUserDto.gender,
      phoneNumber: createUserDto.phoneNumber,
      attributes: [],
      helicopters: [],
      attributeHelicopters: [],
      engines: [],
    };

    it('should create a new user', async () => {
      jest.spyOn(mockUserRepository, 'create').mockReturnValue(createdUser);
      jest.spyOn(mockUserRepository, 'save').mockReturnValue(of(createdUser));
      jest.spyOn(bcrypt, 'hash').mockImplementation(() => hashed);

      const observableResult = service.create(createUserDto);
      const result = await observableResult.toPromise();

      expect(mockUserRepository.create).toHaveBeenCalledWith(createUserDto);
      expect(mockUserRepository.save).toHaveBeenCalledWith(createdUser);
      expect(result).toEqual(createdUser);
    });

    it('should throw BadRequestException if user already exists', async () => {
      jest.spyOn(bcrypt, 'hash').mockImplementation(() => hashed);
      jest.spyOn(mockUserRepository, 'create').mockReturnValue(createUserDto);
      jest.spyOn(mockUserRepository, 'save').mockImplementation(() => {
        return throwError({ code: '23505' });
      });

      await expect(service.create(createUserDto).toPromise()).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw InternalServerErrorException if an error occurs', async () => {
      mockUserRepository.save.mockResolvedValue(createdUser);
      try {
        await await service.create(createUserDto).toPromise();
      } catch (error) {
        expect(error).toBeInstanceOf(InternalServerErrorException);
        expect(error.message).toBe('Failed to create user.');
      }
    });
  });

  describe('findAll', () => {
    const user: UserDto = {
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

    it('should find all users', async () => {
      const users = [user];

      jest.spyOn(mockUserRepository, 'find').mockReturnValue(of(users));
      const result = await service.findAll().toPromise();

      expect(result).toEqual(users);
      expect(mockUserRepository.find).toHaveBeenCalledWith({
        relations: [
          'helicopters',
          'attributeHelicopters',
          'attributes',
          'engines',
        ],
      });
    });

    it('should throw InternalServerErrorException if an error occurs', async () => {
      jest.spyOn(mockUserRepository, 'find').mockResolvedValue(undefined);

      try {
        await service.findAll();
      } catch (error) {
        expect(error).toBeInstanceOf(InternalServerErrorException);
        expect(error.message).toBe('Failed to get all users.');
      }
    });
  });

  describe('findOne', () => {
    const userId: number = 1;

    const user: UserDto = {
      id: userId,
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

    it('should find user by ID', async () => {
      mockUserRepository.findOne.mockResolvedValue(user);

      const result = await service.findOne(userId).toPromise();

      expect(result).toEqual(user);

      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { id: userId },
        relations: [
          'helicopters',
          'attributeHelicopters',
          'attributes',
          'engines',
        ],
      });
    });

    it('should throw NotFoundException if user is not found by ID', async () => {
      jest.spyOn(mockUserRepository, 'findOne').mockReturnValue(of(null));

      try {
        await service.findOne(userId);
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
        expect(error.message).toBe(`User with ID:${userId} was not found.`);

        expect(mockUserRepository.findOne).toHaveBeenCalledWith({
          where: { id: userId },
          relations: [
            'helicopters',
            'attributeHelicopters',
            'attributes',
            'engines',
          ],
        });
      }
    });

    it('should throw InternalServerErrorException if an error occurs', async () => {
      mockUserRepository.findOne.mockRejectedValue(new Error());

      await expect(service.findOne(userId).toPromise()).rejects.toThrow(
        InternalServerErrorException,
      );

      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { id: userId },
        relations: [
          'helicopters',
          'attributeHelicopters',
          'attributes',
          'engines',
        ],
      });
    });
  });

  describe('update', () => {
    const userId: number = 1;

    const updateUserDto: UpdateUserDto = {
      firstName: 'John',
      lastName: 'Doe',
      gender: Gender.MALE,
      email: 'johndoe@gmail.com',
      password: 'abc123',
      phoneNumber: '+37368345678',
    };

    const foundUser: UserDto = {
      id: userId,
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

    const updatedUser: UserDto = {
      id: foundUser.id,
      createdAt: foundUser.createdAt,
      updatedAt: new Date(),
      firstName: updateUserDto.firstName,
      lastName: updateUserDto.lastName,
      email: updateUserDto.email,
      password: updateUserDto.password,
      gender: updateUserDto.gender,
      phoneNumber: updateUserDto.phoneNumber,
      attributes: [],
      helicopters: [],
      attributeHelicopters: [],
      engines: [],
    };

    it('should update an user', async () => {
      mockUserRepository.findOne.mockResolvedValue(foundUser);
      mockUserRepository.save.mockResolvedValue(updatedUser);

      const result = await service.update(userId, updateUserDto).toPromise();

      expect(result).toEqual(updatedUser);

      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { id: userId },
        relations: [
          'helicopters',
          'attributeHelicopters',
          'attributes',
          'engines',
        ],
      });
    });

    it('should throw NotFoundException if user is not found by ID', async () => {
      jest.spyOn(mockUserRepository, 'findOne').mockResolvedValue(undefined);

      try {
        await service.update(userId, updateUserDto).toPromise();
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
        expect(error.message).toBe(`User with ID:${userId} was not found.`);
      }

      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { id: userId },
        relations: [
          'helicopters',
          'attributeHelicopters',
          'attributes',
          'engines',
        ],
      });
    });

    it('should throw InternalServerErrorException if an error occurs', async () => {
      jest.spyOn(mockUserRepository, 'findOne').mockResolvedValue(foundUser);
      jest.spyOn(mockUserRepository, 'save').mockRejectedValue(new Error());

      try {
        await service.update(userId, updateUserDto);
      } catch (error) {
        expect(error).toBeInstanceOf(InternalServerErrorException);
        expect(error.message).toBe('Failed to update user.');

        expect(mockUserRepository.findOne).toHaveBeenCalledWith({
          where: { id: userId },
          relations: [
            'helicopters',
            'attributeHelicopters',
            'attributes',
            'engines',
          ],
        });
      }
    });
  });

  describe('remove', () => {
    const userId: number = 1;
    const helicopterId: number = 1;
    const engineId: number = 2;
    const attributeId: number = 1;
    const attributeHelicopterId: number = 3;

    const foundUser: UserDto = {
      id: userId,
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

    const engine: EngineDto = {
      id: engineId,
      createdAt: new Date(),
      updatedAt: new Date(),
      name: 'Engine XYZ',
      year: 2023,
      model: 'Model ABC',
      hp: 300,
      helicopters: [],
      creator: foundUser,
    };

    const attribute: AttributesDto = {
      id: attributeId,
      name: 'Atttribute',
      createdAt: new Date(),
      updatedAt: new Date(),
      creator: foundUser,
    };

    const attributeHelicopter: AttributeHelicopterResponseDto = {
      id: attributeHelicopterId,
      createdAt: new Date(),
      updatedAt: new Date(),
      helicopters: [],
      attributes: [
        {
          attributeId: attribute.id,
          attribute: attribute,
          value: 'Value',
        },
      ],
    };

    const helicopter: HelicopterDto = {
      id: helicopterId,
      createdAt: new Date(),
      updatedAt: new Date(),
      model: 'ABC-1101',
      year: 2023,
      engineId: engine.id,
      engine: engine,
      attributeHelicopterId: attributeHelicopter.id,
      attributeHelicopter: attributeHelicopter,
    };

    engine.helicopters = attributeHelicopter.helicopters = [helicopter];
    foundUser.helicopters = [helicopter];
    foundUser.attributes = [attribute];
    foundUser.engines = [engine];
    foundUser.attributeHelicopters = [attributeHelicopter];

    it('should remove user', async () => {
      jest.spyOn(mockUserRepository, 'findOne').mockResolvedValue(foundUser);
      jest.spyOn(mockUserRepository, 'remove').mockResolvedValue({});

      jest.spyOn(helicopterRepository, 'findOne').mockResolvedValue(helicopter);
      jest.spyOn(helicopterRepository, 'remove').mockResolvedValue({});

      jest.spyOn(engineRepository, 'findOne').mockResolvedValue(engine);
      jest.spyOn(engineRepository, 'remove').mockResolvedValue({});

      jest.spyOn(attributeRepository, 'findOne').mockResolvedValue(attribute);
      jest.spyOn(attributeRepository, 'remove').mockResolvedValue({});

      jest
        .spyOn(attributeHelicopterRepository, 'findOne')
        .mockResolvedValue(attributeHelicopter);
      jest.spyOn(attributeHelicopterRepository, 'remove').mockResolvedValue({});

      await service.remove(userId).toPromise();

      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { id: userId },
        relations: [
          'helicopters',
          'helicopters.attributeHelicopter',
          'attributes',
          'engines',
          'attributeHelicopters',
        ],
      });

      expect(mockUserRepository.remove).toHaveBeenCalledWith(foundUser);
    });

    it('should throw NotFoundException if user is not found by ID', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(service.remove(userId).toPromise()).rejects.toThrow(
        NotFoundException,
      );

      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { id: userId },
        relations: [
          'helicopters',
          'helicopters.attributeHelicopter',
          'attributes',
          'engines',
          'attributeHelicopters',
        ],
      });
    });

    it('should throw InternalServerErrorException if an error occurs', async () => {
      jest.spyOn(mockUserRepository, 'findOne').mockResolvedValue(foundUser);
      jest.spyOn(mockUserRepository, 'remove').mockRejectedValue(new Error());

      jest.spyOn(helicopterRepository, 'findOne').mockResolvedValue(helicopter);
      jest.spyOn(engineRepository, 'findOne').mockResolvedValue(engine);
      jest.spyOn(attributeRepository, 'findOne').mockResolvedValue(attribute);
      jest
        .spyOn(attributeHelicopterRepository, 'findOne')
        .mockResolvedValue(attributeHelicopter);

      try {
        await service.remove(userId).toPromise();
      } catch (error) {
        expect(error).toBeInstanceOf(InternalServerErrorException);
        expect(error.message).toBe('Failed to delete user or related data.');

        expect(mockUserRepository.findOne).toHaveBeenCalledWith({
          where: { id: userId },
          relations: [
            'helicopters',
            'helicopters.attributeHelicopter',
            'attributes',
            'engines',
            'attributeHelicopters',
          ],
        });

        expect(mockUserRepository.remove).toHaveBeenCalledWith(foundUser);
      }
    });
  });
});
