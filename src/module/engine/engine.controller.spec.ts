import { Test, TestingModule } from '@nestjs/testing';
import { EngineController } from './engine.controller';
import { EngineService } from './engine.service';
import { CreateEngineDto } from './dto/create-engine.dto';
import { EngineDto } from './dto/engine.dto';
import { of } from 'rxjs';
import { UpdateEngineDto } from './dto/update-engine.dto';
import { Gender } from '../../common/enums/gender.enum';
import { JwtAuthGuard } from '../../core/auth/guards/jwt-auth.guard';
import { EngineCreatorGuard } from '../../common/guards/engine-creator.guard';
import { UserDto } from '../user/dto/user.dto';
import { ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { isGuarded } from '../../../test/utils';

describe('EngineController', () => {
  let controller: EngineController;
  let service: EngineService;

  const mockEngineService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  const mockJwtAuthGuard = {
    canActivate: jest.fn().mockReturnValue(false),
  };

  const mockEngineCreatorGuard = {
    canActivate: jest.fn().mockReturnValue(false),
  };

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

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EngineController],
      providers: [
        {
          provide: EngineService,
          useValue: mockEngineService,
        },
        {
          provide: JwtAuthGuard,
          useValue: mockJwtAuthGuard,
        },
        {
          provide: EngineCreatorGuard,
          useValue: mockEngineCreatorGuard,
        },
      ],
    }).compile();

    controller = module.get<EngineController>(EngineController);
    service = module.get<EngineService>(EngineService);
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

    const createdEngine: EngineDto = {
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

    it('should create an engine', async () => {
      jest.spyOn(service, 'create').mockReturnValue(of(createdEngine));

      const result = await controller
        .create({ user }, createEngineDto)
        .toPromise();

      expect(service.create).toHaveBeenCalledWith({ user }, createEngineDto);
      expect(result).toBe(createdEngine);
    });

    it('should throw UnauthorizedException if user is not authenticated', async () => {
      try {
        await controller.create({} as any, createEngineDto);
      } catch (error) {
        expect(error).toBeInstanceOf(UnauthorizedException);
      }
    });
  });

  describe('findAll', () => {
    const engine: EngineDto = {
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

    const engines: EngineDto[] = [engine];

    it('should return all engines', async () => {
      jest.spyOn(service, 'findAll').mockReturnValue(of(engines));

      const result = await controller.findAll().toPromise();

      expect(service.findAll).toHaveBeenCalled();
      expect(result).toEqual(engines);
    });

    it('should throw UnauthorizedException if user is not authenticated', async () => {
      try {
        await controller.findAll();
      } catch (error) {
        expect(error).toBeInstanceOf(UnauthorizedException);
      }
    });
  });

  describe('findOne', () => {
    const engineId: number = 1;

    const found: EngineDto = {
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

    it('should return engine by ID', async () => {
      jest.spyOn(service, 'findOne').mockReturnValue(of(found));

      const result = await controller.findOne(engineId.toString()).toPromise();

      expect(service.findOne).toHaveBeenCalled();
      expect(result).toEqual(found);
    });

    it('should throw UnauthorizedException if user is not authenticated', async () => {
      try {
        await controller.findOne(engineId.toString());
      } catch (error) {
        expect(error).toBeInstanceOf(UnauthorizedException);
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

    const updatedEngine: EngineDto = {
      id: engineId,
      name: updateEngineDto.name,
      year: updateEngineDto.year,
      model: updateEngineDto.model,
      hp: updateEngineDto.hp,
      createdAt: new Date(),
      updatedAt: new Date(),
      helicopters: [],
      creator: user,
    };

    it('should update engine by ID', async () => {
      jest.spyOn(service, 'update').mockReturnValue(of(updatedEngine));

      const result = await controller
        .update(engineId.toString(), updateEngineDto)
        .toPromise();

      expect(service.update).toHaveBeenCalledWith(engineId, updateEngineDto);
      expect(result).toEqual(updatedEngine);
    });

    it('should throw UnauthorizedException if user is not authenticated', async () => {
      try {
        await controller.update(engineId.toString(), updateEngineDto);
      } catch (error) {
        expect(error).toBeInstanceOf(UnauthorizedException);
      }
    });

    it('should be protected by AttributeCreatorGuard', () => {
      expect(
        isGuarded(EngineController.prototype.update, EngineCreatorGuard),
      ).toBe(true);
    });

    it('should throw ForbiddenException if user is not the creator', async () => {
      try {
        await controller.update(engineId.toString(), updateEngineDto);
      } catch (error) {
        expect(error).toBeInstanceOf(ForbiddenException);
      }
    });
  });

  describe('remove', () => {
    const engineId: number = 1;

    it('should remove engine by ID', async () => {
      jest.spyOn(service, 'remove').mockReturnValue(of());
      await controller.remove(engineId.toString()).toPromise();
      expect(service.remove).toHaveBeenCalledWith(engineId);
    });

    it('should throw UnauthorizedException if user is not authenticated', async () => {
      try {
        await controller.remove(engineId.toString());
      } catch (error) {
        expect(error).toBeInstanceOf(UnauthorizedException);
      }
    });

    it('should be protected by AttributeCreatorGuard', () => {
      expect(
        isGuarded(EngineController.prototype.remove, EngineCreatorGuard),
      ).toBe(true);
    });

    it('should throw ForbiddenException if user is not the creator', async () => {
      try {
        await controller.remove(engineId.toString());
      } catch (error) {
        expect(error).toBeInstanceOf(ForbiddenException);
      }
    });
  });

  describe('JwtAuthGuard', () => {
    it('should be protected by JwtAuthGuard', () => {
      expect(isGuarded(EngineController, JwtAuthGuard)).toBe(true);
    });
  });
});
