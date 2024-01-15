import { UserDto } from '../../module/user/dto';
import { plainToInstance } from 'class-transformer';
import { Test, TestingModule } from '@nestjs/testing';
import { AttributeHelicopterController } from './attribute-helicopter.controller';
import { AttributeHelicopterService } from './attribute-helicopter.service';
import { Attribute } from '../attributes/entities/attribute.entity';
import { AttributeHelicopter } from './entities/attribute-helicopter.entity';
import { of, throwError } from 'rxjs';
import {
  UpdateAttributeHelicopterDto,
  CreateAttributeHelicopterDto,
  AttributeHelicopterResponseDto,
} from './dto';
import { User } from '../user/entities/user.entity';
import { Gender } from '../../common/enums/gender.enum';
import { JwtAuthGuard } from '../../core/auth/guards/jwt-auth.guard';
import { AttributeHelicopterCreatorGuard } from '../../common/guards';
import { ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { isGuarded } from '../../../test/utils';

describe('AttributeHelicopterController', () => {
  let controller: AttributeHelicopterController;
  let service: AttributeHelicopterService;

  const mockAttributeHelicopterService = {
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

  const mockAttributeHelicopterCreatorGuard = {
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
      controllers: [AttributeHelicopterController],
      providers: [
        {
          provide: AttributeHelicopterService,
          useValue: mockAttributeHelicopterService,
        },
        {
          provide: JwtAuthGuard,
          useValue: mockJwtAuthGuard,
        },
        {
          provide: AttributeHelicopterCreatorGuard,
          useValue: mockAttributeHelicopterCreatorGuard,
        },
      ],
    }).compile();

    controller = module.get<AttributeHelicopterController>(
      AttributeHelicopterController,
    );
    service = module.get<AttributeHelicopterService>(
      AttributeHelicopterService,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    const createAttributeHelicopterDto: CreateAttributeHelicopterDto = {
      attributeIds: [1, 2],
      values: ['Value 1', 'Value 2'],
    };

    const attributes: Attribute[] = [
      {
        id: createAttributeHelicopterDto.attributeIds[0],
        name: 'Attribute 1',
        createdAt: new Date(),
        updatedAt: new Date(),
        attributeHelicopters: [],
        creator: user,
      },
      {
        id: createAttributeHelicopterDto.attributeIds[1],
        name: 'Attribute 2',
        createdAt: new Date(),
        updatedAt: new Date(),
        attributeHelicopters: [],
        creator: user,
      },
    ];

    const createdAttributeHelicopter: AttributeHelicopter = {
      id: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
      attributes,
      values: createAttributeHelicopterDto.values,
      helicopters: [],
      creator: user,
    };

    const expectedResponse: AttributeHelicopterResponseDto =
      AttributeHelicopterResponseDto.ToResponse(createdAttributeHelicopter);

    it('should create an attribute helicopter', async () => {
      jest.spyOn(service, 'create').mockReturnValue(of(expectedResponse));

      const result = await controller
        .create({ user }, createAttributeHelicopterDto)
        .toPromise();

      expect(service.create).toHaveBeenCalledWith(
        { user },
        createAttributeHelicopterDto,
      );
      expect(result).toBe(expectedResponse);
    });

    it('should throw UnauthorizedException if user is not authenticated', async () => {
      try {
        await controller.create({} as any, createAttributeHelicopterDto);
      } catch (error) {
        expect(error).toBeInstanceOf(UnauthorizedException);
      }
    });
  });

  describe('findAll', () => {
    const expectedResponse: AttributeHelicopterResponseDto = {
      id: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
      attributes: [],
      helicopters: [],
      creator: plainToInstance(UserDto, user),
    };

    const attributeHelicopters = [expectedResponse];

    it('should return all attribute helicopters', async () => {
      jest.spyOn(service, 'findAll').mockReturnValue(of(attributeHelicopters));

      const result = await controller.findAll().toPromise();

      expect(service.findAll).toHaveBeenCalled();
      expect(result).toEqual(attributeHelicopters);
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
    const expectedResponse: AttributeHelicopterResponseDto = {
      id: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
      attributes: [],
      helicopters: [],
      creator: plainToInstance(UserDto, user),
    };

    const attributeHelicopters = [expectedResponse];

    it('should return all attribute helicopters of a creator', async () => {
      jest
        .spyOn(service, 'findAllByCreator')
        .mockReturnValue(of(attributeHelicopters));

      const result = await controller
        .findAllByCreator({ user: { email } })
        .toPromise();

      expect(service.findAllByCreator).toHaveBeenCalled();
      expect(result).toEqual(attributeHelicopters);
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
    const attributeHelicopterId: number = 1;

    const expectedResponse: AttributeHelicopterResponseDto = {
      id: attributeHelicopterId,
      createdAt: new Date(),
      updatedAt: new Date(),
      attributes: [],
      helicopters: [],
      creator: plainToInstance(UserDto, user),
    };

    it('should return attribute helicopter by ID', async () => {
      jest.spyOn(service, 'findOne').mockReturnValue(of(expectedResponse));

      const result = await controller
        .findOne(attributeHelicopterId.toString())
        .toPromise();

      expect(service.findOne).toHaveBeenCalled();
      expect(result).toEqual(expectedResponse);
    });

    it('should throw UnauthorizedException if user is not authenticated', async () => {
      try {
        await controller.findOne(attributeHelicopterId.toString());
      } catch (error) {
        expect(error).toBeInstanceOf(UnauthorizedException);
      }
    });
  });

  describe('update', () => {
    const attributeHelicopterId: number = 1;

    const updateHelicopterAttriuteDto: UpdateAttributeHelicopterDto = {
      attributeIds: [1, 3],
      values: ['Edit 1', 'Edit 3'],
    };

    const attributes: Attribute[] = [
      {
        id: updateHelicopterAttriuteDto.attributeIds[0],
        name: 'Attribute 1',
        createdAt: new Date(),
        updatedAt: new Date(),
        attributeHelicopters: [],
        creator: user,
      },
      {
        id: updateHelicopterAttriuteDto.attributeIds[1],
        name: 'Attribute 3',
        createdAt: new Date(),
        updatedAt: new Date(),
        attributeHelicopters: [],
        creator: user,
      },
    ];

    const found: AttributeHelicopter = {
      id: attributeHelicopterId,
      createdAt: new Date(),
      updatedAt: new Date(),
      attributes: [],
      values: [],
      helicopters: [],
      creator: user,
    };

    const updatedAttributeHelicopter: AttributeHelicopter = {
      id: attributeHelicopterId,
      createdAt: found.createdAt,
      updatedAt: new Date(),
      values: updateHelicopterAttriuteDto.values,
      attributes,
      helicopters: [],
      creator: user,
    };

    const expected = AttributeHelicopterResponseDto.ToResponse(
      updatedAttributeHelicopter,
    );

    it('should update attribute helicopter by ID', async () => {
      jest.spyOn(service, 'update').mockReturnValue(of(expected));

      const result = await controller
        .update(attributeHelicopterId.toString(), updateHelicopterAttriuteDto)
        .toPromise();

      expect(service.update).toHaveBeenCalledWith(
        attributeHelicopterId,
        updateHelicopterAttriuteDto,
      );
      expect(result).toEqual(expected);
    });

    it('should throw UnauthorizedException if user is not authenticated', async () => {
      try {
        await controller.update(
          attributeHelicopterId.toString(),
          updateHelicopterAttriuteDto,
        );
      } catch (error) {
        expect(error).toBeInstanceOf(UnauthorizedException);
      }
    });

    it('should be protected by AttributeHelicopterCreatorGuard', () => {
      expect(
        isGuarded(
          AttributeHelicopterController.prototype.update,
          AttributeHelicopterCreatorGuard,
        ),
      ).toBe(true);
    });

    it('should throw ForbiddenException if user is not the creator', async () => {
      try {
        await controller.update(
          attributeHelicopterId.toString(),
          updateHelicopterAttriuteDto,
        );
      } catch (error) {
        expect(error).toBeInstanceOf(ForbiddenException);
      }
    });
  });

  describe('remove', () => {
    const attributeHelicopterId: number = 1;

    it('should remove attribute helicopter by ID', async () => {
      jest.spyOn(service, 'remove').mockReturnValue(of());
      await controller.remove(attributeHelicopterId.toString()).toPromise();
      expect(service.remove).toHaveBeenCalledWith(attributeHelicopterId);
    });

    it('should throw UnauthorizedException if user is not authenticated', async () => {
      try {
        await controller.remove(attributeHelicopterId.toString());
      } catch (error) {
        expect(error).toBeInstanceOf(UnauthorizedException);
      }
    });

    it('should be protected by AttributeHelicopterCreatorGuard', () => {
      expect(
        isGuarded(
          AttributeHelicopterController.prototype.remove,
          AttributeHelicopterCreatorGuard,
        ),
      ).toBe(true);
    });

    it('should throw ForbiddenException if user is not the creator', async () => {
      try {
        await controller.remove(attributeHelicopterId.toString());
      } catch (error) {
        expect(error).toBeInstanceOf(ForbiddenException);
      }
    });
  });

  describe('JwtAuthGuard', () => {
    it('should be protected by JwtAuthGuard', () => {
      expect(isGuarded(AttributeHelicopterController, JwtAuthGuard)).toBe(true);
    });
  });
});
