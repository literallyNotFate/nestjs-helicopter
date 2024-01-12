import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { Gender } from '../../common/enums/gender.enum';
import { UserDto, CreateUserDto, UpdateUserDto } from './dto';
import { of } from 'rxjs';

describe('UserController', () => {
  let controller: UserController;
  let service: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<UserController>(UserController);
    service = module.get<UserService>(UserService);
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

    it('should create an user', async () => {
      jest.spyOn(service, 'create').mockReturnValue(of(createdUser));

      const result = await controller.create(createUserDto).toPromise();

      expect(service.create).toHaveBeenCalledWith(createUserDto);
      expect(result).toBe(createdUser);
    });
  });

  describe('findAll', () => {
    const user: UserDto = {
      id: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
      firstName: 'First',
      lastName: 'Last',
      email: 'some@email.com',
      password: '11223344',
      gender: Gender.MALE,
      phoneNumber: '+3736923245',
      attributes: [],
      helicopters: [],
      attributeHelicopters: [],
      engines: [],
    };

    const users: UserDto[] = [user];

    it('should return all users', async () => {
      jest.spyOn(service, 'findAll').mockReturnValue(of(users));

      const result = await controller.findAll().toPromise();

      expect(service.findAll).toHaveBeenCalled();
      expect(result).toEqual(users);
    });
  });

  describe('findOne', () => {
    const userId: number = 1;

    const user: UserDto = {
      id: userId,
      createdAt: new Date(),
      updatedAt: new Date(),
      firstName: 'First',
      lastName: 'Last',
      email: 'some@email.com',
      password: '11223344',
      gender: Gender.MALE,
      phoneNumber: '+3736923245',
      attributes: [],
      helicopters: [],
      attributeHelicopters: [],
      engines: [],
    };

    it('should return user by ID', async () => {
      jest.spyOn(service, 'findOne').mockReturnValue(of(user));

      const result = await controller.findOne(userId.toString()).toPromise();

      expect(service.findOne).toHaveBeenCalled();
      expect(result).toEqual(user);
    });
  });

  describe('update', () => {
    const userId: number = 1;

    const updateUserDto: UpdateUserDto = {
      firstName: 'edit',
      lastName: 'edit',
      email: 'edit@email.com',
      password: '11223344',
      gender: Gender.OTHER,
      phoneNumber: '+3736923245',
    };

    const user: UserDto = {
      id: userId,
      createdAt: new Date(),
      updatedAt: new Date(),
      firstName: 'First',
      lastName: 'Last',
      email: 'some@email.com',
      password: '11223344',
      gender: Gender.MALE,
      phoneNumber: '+3736923245',
      attributes: [],
      helicopters: [],
      attributeHelicopters: [],
      engines: [],
    };

    const updatedUser: UserDto = {
      id: user.id,
      createdAt: user.createdAt,
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

    it('should update user by ID', async () => {
      jest.spyOn(service, 'update').mockReturnValue(of(updatedUser));

      const result = await controller
        .update(userId.toString(), updateUserDto)
        .toPromise();

      expect(service.update).toHaveBeenCalledWith(userId, updateUserDto);
      expect(result).toEqual(updatedUser);
    });
  });

  describe('remove', () => {
    const userId: number = 1;

    it('should remove user by ID', async () => {
      jest.spyOn(service, 'remove').mockReturnValue(of());
      await controller.remove(userId.toString()).toPromise();
      expect(service.remove).toHaveBeenCalledWith(userId);
    });
  });
});
