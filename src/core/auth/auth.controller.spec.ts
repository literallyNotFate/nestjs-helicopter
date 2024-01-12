import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { RegisterDto, TokensDto, LoginDto } from './dto';
import { of } from 'rxjs';
import { UserRepository } from '../../module/user/user.repository';
import { JwtService } from '@nestjs/jwt';
import { User } from '../../module/user/entities/user.entity';

describe('AuthController', () => {
  let controller: AuthController;
  let service: AuthService;

  const mockUserRepository = {
    getByEmail: jest.fn(),
    create: jest.fn(),
  };

  const token: TokensDto = {
    accessToken: 'token',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
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

    controller = module.get<AuthController>(AuthController);
    service = module.get<AuthService>(AuthService);
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

    it('should register a new user and return access token', async () => {
      jest.spyOn(service, 'register').mockReturnValue(of(token));

      const result = await controller.register(registerDto).toPromise();
      expect(result).toEqual(token);
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
      password: '1234',
      phoneNumber: '2184128',
      helicopters: [],
      attributeHelicopters: [],
      attributes: [],
      engines: [],
    };

    const loginDto: LoginDto = {
      email: 'johndoe@gmail.com',
      password: '1234',
    };

    it('should login into account and return access token', async () => {
      jest.spyOn(service, 'getJWT').mockReturnValue(of(token));
      jest
        .spyOn(mockUserRepository, 'getByEmail')
        .mockReturnValue(of(existingUser));
      jest.spyOn(service, 'verifyPassword').mockResolvedValue(true);

      const result = await controller.login(loginDto).toPromise();
      expect(result).toEqual(token);
    });
  });
});
