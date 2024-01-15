import { Test, TestingModule } from '@nestjs/testing';
import { HelicopterController } from './helicopter.controller';
import { HelicopterService } from './helicopter.service';
import { CreateHelicopterDto, HelicopterDto, UpdateHelicopterDto } from './dto';
import { of, throwError } from 'rxjs';
import { User } from '../user/entities/user.entity';
import { Gender } from '../../common/enums/gender.enum';
import { JwtAuthGuard } from '../../core/auth/guards/jwt-auth.guard';
import { HelicopterCreatorGuard } from '../../common/guards';
import { plainToInstance } from 'class-transformer';
import { UserDto } from '../user/dto';
import { AttributeHelicopterResponseDto } from '../attribute-helicopter/dto';
import { ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { isGuarded } from '../../../test/utils';

describe('HelicopterController', () => {
  let controller: HelicopterController;
  let service: HelicopterService;

  const mockHelicopterService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findAllByCreator: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  const mockJwtAuthGuard = {
    canActivate: jest.fn().mockReturnValue(false),
  };

  const mockHelicopterCreatorGuard = {
    canActivate: jest.fn().mockReturnValue(false),
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
      controllers: [HelicopterController],
      providers: [
        {
          provide: HelicopterService,
          useValue: mockHelicopterService,
        },
        {
          provide: JwtAuthGuard,
          useValue: mockJwtAuthGuard,
        },
        {
          provide: HelicopterCreatorGuard,
          useValue: mockHelicopterCreatorGuard,
        },
      ],
    }).compile();

    controller = module.get<HelicopterController>(HelicopterController);
    service = module.get<HelicopterService>(HelicopterService);
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

    const foundAttribute: AttributeHelicopterResponseDto = {
      id: attributeHelicopterId,
      createdAt: new Date(),
      updatedAt: new Date(),
      helicopters: [],
      attributes: [],
      creator: plainToInstance(UserDto, user),
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
        creator: plainToInstance(UserDto, user),
      },
      attributeHelicopterId,
      attributeHelicopter: foundAttribute,
      creator: plainToInstance(UserDto, user),
    };

    it('should create a helicopter', async () => {
      jest.spyOn(service, 'create').mockReturnValue(of(createdHelicopter));

      const result = await controller
        .create({ user }, createHelicopterDto)
        .toPromise();

      expect(service.create).toHaveBeenCalledWith(
        { user },
        createHelicopterDto,
      );
      expect(result).toEqual(createdHelicopter);
    });

    it('should throw UnauthorizedException if user is not authenticated', async () => {
      try {
        await controller.create({} as any, createHelicopterDto);
      } catch (error) {
        expect(error).toBeInstanceOf(UnauthorizedException);
      }
    });
  });

  describe('findAll', () => {
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
      attributeHelicopterId: 1,
      attributeHelicopter: {
        id: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
        helicopters: [],
        attributes: [],
        creator: plainToInstance(UserDto, user),
      },
      creator: plainToInstance(UserDto, user),
    };

    const helicopters: HelicopterDto[] = [helicopter];

    it('should return all helicopters', async () => {
      jest.spyOn(service, 'findAll').mockReturnValue(of(helicopters));

      const result = await controller.findAll().toPromise();

      expect(service.findAll).toHaveBeenCalled();
      expect(result).toEqual(helicopters);
    });

    it('should throw UnauthorizedException if user is not authenticated', async () => {
      try {
        await controller.findAll();
      } catch (error) {
        expect(error).toBeInstanceOf(UnauthorizedException);
      }
    });
  });

  describe('findAllByCreator', () => {
    const email: string = user.email;

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
      attributeHelicopterId: 1,
      attributeHelicopter: {
        id: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
        helicopters: [],
        attributes: [],
        creator: plainToInstance(UserDto, user),
      },
      creator: plainToInstance(UserDto, user),
    };

    const helicopters: HelicopterDto[] = [helicopter];

    it('should return all helicopters of a creator', async () => {
      jest.spyOn(service, 'findAllByCreator').mockReturnValue(of(helicopters));

      const result = await controller
        .findAllByCreator({ user: { email } })
        .toPromise();

      expect(service.findAllByCreator).toHaveBeenCalled();
      expect(result).toEqual(helicopters);
    });

    it('should throw UnauthorizedException if user is not authenticated', async () => {
      jest
        .spyOn(service, 'findAllByCreator')
        .mockImplementation(() => throwError(new UnauthorizedException()));

      try {
        await controller.findAllByCreator({ user: { email } });
      } catch (error) {
        expect(error).toBeInstanceOf(UnauthorizedException);
      }
    });
  });

  describe('findOne', () => {
    const helicopterId: number = 1;

    const found: HelicopterDto = {
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
      attributeHelicopter: {
        id: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
        helicopters: [],
        attributes: [],
        creator: plainToInstance(UserDto, user),
      },
      creator: plainToInstance(UserDto, user),
    };

    it('should return helicopter by ID', async () => {
      jest.spyOn(service, 'findOne').mockReturnValue(of(found));

      const result = await controller
        .findOne(helicopterId.toString())
        .toPromise();

      expect(service.findOne).toHaveBeenCalled();
      expect(result).toEqual(found);
    });

    it('should throw UnauthorizedException if user is not authenticated', async () => {
      try {
        await controller.findOne(helicopterId.toString());
      } catch (error) {
        expect(error).toBeInstanceOf(UnauthorizedException);
      }
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
        name: 'Engine',
        year: 2023,
        model: 'Model',
        hp: 300,
        helicopters: [],
        creator: plainToInstance(UserDto, user),
      },
      attributeHelicopterId: 1,
      attributeHelicopter: {
        id: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
        helicopters: [],
        attributes: [],
        creator: plainToInstance(UserDto, user),
      },
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
        createdAt: new Date(),
        updatedAt: new Date(),
        helicopters: [],
        attributes: [],
        creator: plainToInstance(UserDto, user),
      },
      creator: plainToInstance(UserDto, user),
    };

    it('should update helicopter by ID', async () => {
      jest.spyOn(service, 'update').mockReturnValue(of(updatedHelicopter));

      const result = await controller
        .update(engineId.toString(), updateHelicopterDto)
        .toPromise();

      expect(service.update).toHaveBeenCalledWith(
        engineId,
        updateHelicopterDto,
      );
      expect(result).toEqual(updatedHelicopter);
    });

    it('should throw UnauthorizedException if user is not authenticated', async () => {
      try {
        await controller.update(helicopterId.toString(), updateHelicopterDto);
      } catch (error) {
        expect(error).toBeInstanceOf(UnauthorizedException);
      }
    });

    it('should be protected by HelicopterCreatorGuard', () => {
      expect(
        isGuarded(
          HelicopterController.prototype.update,
          HelicopterCreatorGuard,
        ),
      ).toBe(true);
    });

    it('should throw ForbiddenException if user is not the creator', async () => {
      try {
        await controller.update(helicopterId.toString(), updateHelicopterDto);
      } catch (error) {
        expect(error).toBeInstanceOf(ForbiddenException);
      }
    });
  });

  describe('remove', () => {
    const helicopterId: number = 1;

    it('should remove helicopter by ID', async () => {
      jest.spyOn(service, 'remove').mockReturnValue(of());
      await controller.remove(helicopterId.toString()).toPromise();
      expect(service.remove).toHaveBeenCalledWith(helicopterId);
    });

    it('should throw UnauthorizedException if user is not authenticated', async () => {
      try {
        await controller.remove(helicopterId.toString());
      } catch (error) {
        expect(error).toBeInstanceOf(UnauthorizedException);
      }
    });

    it('should be protected by HelicopterCreatorGuard', () => {
      expect(
        isGuarded(
          HelicopterController.prototype.remove,
          HelicopterCreatorGuard,
        ),
      ).toBe(true);
    });

    it('should throw ForbiddenException if user is not the creator', async () => {
      try {
        await controller.remove(helicopterId.toString());
      } catch (error) {
        expect(error).toBeInstanceOf(ForbiddenException);
      }
    });
  });

  describe('JwtAuthGuard', () => {
    it('should be protected by JwtAuthGuard', () => {
      expect(isGuarded(HelicopterController, JwtAuthGuard)).toBe(true);
    });
  });
});
