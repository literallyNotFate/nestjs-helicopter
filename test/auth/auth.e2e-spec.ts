import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { AppModule } from '../../src/app.module';
import { throwError } from 'rxjs';
import { RegisterDto, LoginDto } from '../../src/core/auth/dto';
import { AuthService } from '../../src/core/auth/auth.service';

describe('Auth (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Endpoints', () => {
    const register: RegisterDto = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'johndoe@gmail.com',
      password: 'abc123',
      phoneNumber: '+37368345678',
    };

    describe('POST /auth/register', () => {
      it(`should register user (${HttpStatus.CREATED})`, async () => {
        const response = await request(app.getHttpServer())
          .post('/auth/register')
          .send(register)
          .expect(HttpStatus.CREATED);

        expect(response.body.accessToken).toBeDefined();
      });

      it(`should throw BadRequest if the fields fail the validation (${HttpStatus.BAD_REQUEST})`, async () => {
        const data = {
          firstName: 'John',
          lastName: '',
          email: 123,
          password: '',
          phoneNumber: '+1234',
        };

        const response = await request(app.getHttpServer())
          .post('/auth/register')
          .send(data);

        expect(response.statusCode).toBe(HttpStatus.BAD_REQUEST);
      });

      it(`should throw BadRequest if the user already exists (${HttpStatus.BAD_REQUEST})`, async () => {
        const data = {
          firstName: 'Jake',
          lastName: 'Smith',
          email: register.email,
          password: 'abc123',
          phoneNumber: '+37368345678',
        };

        const response = await request(app.getHttpServer())
          .post('/auth/register')
          .send(data);

        expect(response.statusCode).toBe(HttpStatus.BAD_REQUEST);
      });

      it(`should throw InternalServerErrorException (${HttpStatus.INTERNAL_SERVER_ERROR})`, async () => {
        const data = {
          firstName: 'Jake',
          lastName: 'Smith',
          email: 'jakesmith@gmail.com',
          password: 'abc123',
          phoneNumber: '+37368345678',
        };

        const service = app.get<AuthService>(AuthService);
        jest
          .spyOn(service, 'register')
          .mockReturnValue(throwError(new Error()));

        const response = await request(app.getHttpServer())
          .post('/auth/register')
          .send(data);

        expect(response.status).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
      });
    });

    describe('POST /auth/login', () => {
      const login: LoginDto = {
        email: register.email,
        password: register.password,
      };

      it(`should login into account (${HttpStatus.OK})`, async () => {
        const response = await request(app.getHttpServer())
          .post('/auth/login')
          .send(login)
          .expect(HttpStatus.OK);

        expect(response.body.accessToken).toBeDefined();
      });

      it(`should throw BadRequest if the fields fail the validation (${HttpStatus.BAD_REQUEST})`, async () => {
        const data = {
          email: 123,
          password: '',
        };

        const response = await request(app.getHttpServer())
          .post('/auth/login')
          .send(data);

        expect(response.statusCode).toBe(HttpStatus.BAD_REQUEST);
      });

      it(`should throw BadRequest if user does not exist (${HttpStatus.BAD_REQUEST})`, async () => {
        const data: LoginDto = {
          email: 'notexistent@gmail.com',
          password: register.password,
        };

        const response = await request(app.getHttpServer())
          .post('/auth/login')
          .send(data);

        expect(response.statusCode).toBe(HttpStatus.BAD_REQUEST);
      });

      it(`should throw BadRequest if password is invalid (${HttpStatus.INTERNAL_SERVER_ERROR})`, async () => {
        const data: LoginDto = {
          email: register.email,
          password: 'wrongpass',
        };

        const response = await request(app.getHttpServer())
          .post('/auth/login')
          .send(data);

        expect(response.statusCode).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
      });

      it(`should throw InternalServerErrorException (${HttpStatus.INTERNAL_SERVER_ERROR})`, async () => {
        const service = app.get<AuthService>(AuthService);
        jest.spyOn(service, 'login').mockReturnValue(throwError(new Error()));

        const response = await request(app.getHttpServer())
          .post('/auth/login')
          .send(login);

        expect(response.status).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
      });
    });
  });
});
