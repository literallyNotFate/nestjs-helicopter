import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UserRepository } from '../../module/user/user.repository';
import { of, throwError } from 'rxjs';
import * as bcrypt from 'bcrypt';
import { User } from '../../module/user/entities/user.entity';
import {
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { RegisterDto, TokensDto, LoginDto } from './dto';
import { JwtService } from '@nestjs/jwt';

describe('AuthService', () => {
  let service: AuthService;
  let userRepository: UserRepository;

  const mockUserRepository = {
    getByEmail: jest.fn(),
    create: jest.fn(),
  };

  const token: TokensDto = {
    accessToken: 'token',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UserRepository,
          useValue: mockUserRepository,
        },
        {
          provide: JwtService,
          useValue: {
            signAsync: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userRepository = module.get<UserRepository>(UserRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    const registerDto: RegisterDto = {
      email: 'johndoe@gmail.com',
      firstName: 'John',
      lastName: 'Doe',
      password: '1234',
      phoneNumber: '2184128',
    };

    const registeredUser: User = {
      id: 1,
      email: registerDto.email,
      firstName: registerDto.firstName,
      lastName: registerDto.lastName,
      password: registerDto.password,
      phoneNumber: registerDto.phoneNumber,
      createdAt: new Date(),
      updatedAt: new Date(),
      helicopters: [],
      attributeHelicopters: [],
      attributes: [],
      engines: [],
    };

    const existingUser: User = {
      id: 99,
      createdAt: new Date(),
      updatedAt: new Date(),
      firstName: 'Aboba',
      lastName: 'Aboba',
      email: registerDto.email,
      password: '4321',
      phoneNumber: '2214266',
      helicopters: [],
      attributeHelicopters: [],
      attributes: [],
      engines: [],
    };

    const hashed: string = 'hashed';

    it('should register a new user and return access token', async () => {
      jest
        .spyOn(userRepository, 'getByEmail')
        .mockImplementation(() => of(null));

      jest.spyOn(bcrypt, 'hash').mockImplementation(() => of(hashed));
      jest.spyOn(userRepository, 'create').mockReturnValue(of(registeredUser));
      jest.spyOn(service, 'getJWT').mockImplementation(() => of(token));

      const result = await service.register(registerDto).toPromise();
      expect(result).toEqual(token);

      expect(userRepository.create).toHaveBeenCalledWith({
        ...registerDto,
        password: hashed,
      });

      expect(service.getJWT).toHaveBeenCalledWith(
        registeredUser.id,
        registeredUser.email,
      );
    });

    it('should throw BadRequestException if email already exists', async () => {
      jest
        .spyOn(userRepository, 'getByEmail')
        .mockImplementation(() => of(existingUser));

      try {
        await service.register(registerDto).toPromise();
      } catch (error) {
        expect(error).toBeInstanceOf(BadRequestException);
        expect(error.message).toBe('User with that email already exists');
      }
    });

    it('should throw InternalServerErrorException if an error occurs', async () => {
      jest
        .spyOn(userRepository, 'getByEmail')
        .mockImplementation(() => of(null));

      jest.spyOn(bcrypt, 'hash').mockImplementation(() => of(hashed));
      jest.spyOn(userRepository, 'create').mockReturnValue(of(registeredUser));
      jest.spyOn(service, 'getJWT').mockImplementation(() => of(token));

      try {
        await service.register(registerDto).toPromise();
      } catch (error) {
        expect(error).toBeInstanceOf(InternalServerErrorException);
        expect(error.message).toBe('Failed to register');
      }
    });
  });

  describe('login', () => {
    const existingUser: User = {
      id: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
      firstName: 'John',
      lastName: 'Doe',
      email: 'johndoe@gmail.com',
      password: '12345',
      phoneNumber: '2214266',
      helicopters: [],
      attributeHelicopters: [],
      attributes: [],
      engines: [],
    };

    const loginDto: LoginDto = {
      email: existingUser.email,
      password: existingUser.password,
    };

    it('should log in into user and return access token', async () => {
      jest
        .spyOn(userRepository, 'getByEmail')
        .mockImplementation(() => of(existingUser));

      jest.spyOn(service, 'verifyPassword').mockResolvedValue(true);
      jest.spyOn(service, 'getJWT').mockReturnValue(of(token));

      const result = await service
        .login(loginDto.email, loginDto.password)
        .toPromise();
      expect(result).toEqual(token);

      expect(service.verifyPassword).toHaveBeenCalledWith(
        loginDto.password,
        existingUser.password,
      );
    });

    it('should throw BadRequestException if email does not exist', async () => {
      jest
        .spyOn(userRepository, 'getByEmail')
        .mockImplementation(() =>
          throwError(new BadRequestException('Wrong credentials provided')),
        );

      try {
        await service.login(loginDto.email, loginDto.password).toPromise();
      } catch (error) {
        expect(error).toBeInstanceOf(BadRequestException);
        expect(error.message).toBe('Wrong credentials provided');
      }
    });

    it('should throw BadRequestException if passwords do not match', async () => {
      jest.spyOn(service, 'verifyPassword').mockResolvedValue(false);

      try {
        await service.login(loginDto.email, loginDto.password).toPromise();
      } catch (error) {
        expect(error).toBeInstanceOf(BadRequestException);
        expect(error.message).toBe('Wrong credentials provided');
      }
    });

    it('should throw InternalServerErrorException if an error occurs', async () => {
      jest
        .spyOn(userRepository, 'getByEmail')
        .mockImplementation(() => of(existingUser));

      jest.spyOn(service, 'verifyPassword').mockResolvedValue(true);
      jest.spyOn(service, 'getJWT').mockReturnValue(of(token));

      try {
        await service.login(loginDto.email, loginDto.password).toPromise();
      } catch (error) {
        expect(error).toBeInstanceOf(InternalServerErrorException);
        expect(error.message).toBe('Failed to login');
      }
    });
  });
});
