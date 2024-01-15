import { plainToInstance } from 'class-transformer';
import { Test, TestingModule } from '@nestjs/testing';
import { AttributesDto, CreateAttributeDto, UpdateAttributeDto } from './dto';
import { AttributesController } from './attributes.controller';
import { AttributesService } from './attributes.service';
import { of, throwError } from 'rxjs';
import { JwtAuthGuard } from '../../core/auth/guards/jwt-auth.guard';
import { AttributeCreatorGuard } from '../../common/guards';
import { Gender } from '../../common/enums/gender.enum';
import { User } from '../user/entities/user.entity';
import { Attribute } from './entities/attribute.entity';
import { isGuarded } from '../../../test/utils';
import { UserDto } from '../user/dto';
import { ForbiddenException, UnauthorizedException } from '@nestjs/common';

describe('AttributesController', () => {
  let controller: AttributesController;
  let service: AttributesService;

  const mockAttributeService = {
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

  const mockAttributeCreatorGuard = {
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
      controllers: [AttributesController],
      providers: [
        {
          provide: AttributesService,
          useValue: mockAttributeService,
        },
        {
          provide: JwtAuthGuard,
          useValue: mockJwtAuthGuard,
        },
        {
          provide: AttributeCreatorGuard,
          useValue: mockAttributeCreatorGuard,
        },
      ],
    }).compile();

    controller = module.get<AttributesController>(AttributesController);
    service = module.get<AttributesService>(AttributesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    const createAttributeDto: CreateAttributeDto = {
      name: 'Color',
    };

    const createdAttribute: Attribute = {
      id: 1,
      name: 'Color',
      createdAt: new Date(),
      updatedAt: new Date(),
      creator: user,
      attributeHelicopters: [],
    };

    it('should create an attribute', async () => {
      jest
        .spyOn(service, 'create')
        .mockReturnValue(of(plainToInstance(AttributesDto, createdAttribute)));

      const result = await controller
        .create({ user }, createAttributeDto)
        .toPromise();

      expect(result).toEqual(plainToInstance(AttributesDto, createdAttribute));
    });

    it('should throw UnauthorizedException if user is not authenticated', async () => {
      try {
        await controller.create({} as any, createAttributeDto);
      } catch (error) {
        expect(error).toBeInstanceOf(UnauthorizedException);
      }
    });
  });

  describe('findAll', () => {
    const attribute: AttributesDto = {
      id: 1,
      name: 'Color',
      createdAt: new Date(),
      updatedAt: new Date(),
      creator: plainToInstance(UserDto, user),
    };

    const attributes: AttributesDto[] = [attribute];

    it('should return all attributes', async () => {
      jest.spyOn(service, 'findAll').mockReturnValue(of(attributes));

      const result = await controller.findAll().toPromise();

      expect(service.findAll).toHaveBeenCalled();
      expect(result).toEqual(attributes);
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
    const attribute: AttributesDto = {
      id: 1,
      name: 'Color',
      createdAt: new Date(),
      updatedAt: new Date(),
      creator: plainToInstance(UserDto, user),
    };

    const attributes: AttributesDto[] = [attribute];

    it('should return all attributes of a creator', async () => {
      jest.spyOn(service, 'findAllByCreator').mockReturnValue(of(attributes));

      const result = await controller
        .findAllByCreator({ user: { email } })
        .toPromise();

      expect(service.findAllByCreator).toHaveBeenCalled();
      expect(result).toEqual(attributes);
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
    const attributeId: number = 1;

    const attribute: AttributesDto = {
      id: attributeId,
      name: 'Color',
      createdAt: new Date(),
      updatedAt: new Date(),
      creator: plainToInstance(UserDto, user),
    };

    it('should return attribute by ID', async () => {
      jest.spyOn(service, 'findOne').mockReturnValue(of(attribute));

      const result = await controller
        .findOne(attributeId.toString())
        .toPromise();

      expect(service.findOne).toHaveBeenCalled();
      expect(result).toEqual(attribute);
    });

    it('should throw UnauthorizedException if user is not authenticated', async () => {
      try {
        await controller.findOne(attributeId.toString());
      } catch (error) {
        expect(error).toBeInstanceOf(UnauthorizedException);
      }
    });
  });

  describe('update', () => {
    const attributeId: number = 1;
    const updateAttributeDto: UpdateAttributeDto = {
      name: 'edit',
    };

    const updatedAttribute: AttributesDto = {
      id: attributeId,
      name: updateAttributeDto.name,
      createdAt: new Date(),
      updatedAt: new Date(),
      creator: plainToInstance(UserDto, user),
    };

    it('should update attribute by ID', async () => {
      jest.spyOn(service, 'update').mockReturnValue(of(updatedAttribute));

      const result = await controller
        .update(attributeId.toString(), updateAttributeDto)
        .toPromise();

      expect(service.update).toHaveBeenCalledWith(
        attributeId,
        updateAttributeDto,
      );
      expect(result).toEqual(updatedAttribute);
    });

    it('should be protected by AttributeCreatorGuard', () => {
      expect(
        isGuarded(AttributesController.prototype.update, AttributeCreatorGuard),
      ).toBe(true);
    });

    it('should throw UnauthorizedException if user is not authenticated', async () => {
      try {
        await controller.update(attributeId.toString(), updateAttributeDto);
      } catch (error) {
        expect(error).toBeInstanceOf(UnauthorizedException);
      }
    });

    it('should throw ForbiddenException if user is not the creator', async () => {
      try {
        await controller.update(attributeId.toString(), updateAttributeDto);
      } catch (error) {
        expect(error).toBeInstanceOf(ForbiddenException);
      }
    });
  });

  describe('remove', () => {
    const attributeId: number = 1;

    it('should remove attribute by ID', async () => {
      jest.spyOn(service, 'remove').mockReturnValue(of());

      await controller.remove(attributeId.toString()).toPromise();

      expect(service.remove).toHaveBeenCalledWith(attributeId);
    });

    it('should be protected by AttributeCreatorGuard', () => {
      expect(
        isGuarded(AttributesController.prototype.remove, AttributeCreatorGuard),
      ).toBe(true);
    });

    it('should throw UnauthorizedException if user is not authenticated', async () => {
      try {
        await controller.remove(attributeId.toString());
      } catch (error) {
        expect(error).toBeInstanceOf(UnauthorizedException);
      }
    });

    it('should throw ForbiddenException if user is not the creator', async () => {
      try {
        await controller.remove(attributeId.toString());
      } catch (error) {
        expect(error).toBeInstanceOf(ForbiddenException);
      }
    });
  });

  describe('JwtAuthGuard', () => {
    it('should be protected by JwtAuthGuard', () => {
      expect(isGuarded(AttributesController, JwtAuthGuard)).toBe(true);
    });
  });
});
