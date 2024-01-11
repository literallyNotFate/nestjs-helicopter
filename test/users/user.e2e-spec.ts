import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { AppModule } from '../../src/app.module';
import { throwError } from 'rxjs';
import { UserService } from '../../src/module/user/user.service';

describe('User (e2e)', () => {
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
    let user;

    describe('POST /user', () => {
      const userData = {
        firstName: 'John',
        lastName: 'Doe',
        gender: 'MALE',
        email: 'johndoe@gmail.com',
        password: 'abc123',
        phoneNumber: '+37368345678',
      };

      const test = {
        firstName: 123,
        lastName: '',
        gender: 'MALE',
        email: 'xd@gmail.com',
        password: 'q',
        phoneNumber: '+37368',
      };

      it(`should create an user (${HttpStatus.CREATED})`, async () => {
        const response = await request(app.getHttpServer())
          .post('/user')
          .send(userData);

        expect(response.statusCode).toBe(HttpStatus.CREATED);
        expect(response.body).toHaveProperty('id');
        expect(response.body.firstName).toBe(userData.firstName);

        user = response.body;
      });

      it(`should throw BadRequest if the fields fail the validation (${HttpStatus.BAD_REQUEST})`, async () => {
        const response = await request(app.getHttpServer())
          .post('/user')
          .send(test);

        expect(response.statusCode).toBe(HttpStatus.BAD_REQUEST);
      });

      it(`should throw BadRequest if user already exists (${HttpStatus.BAD_REQUEST})`, async () => {
        const response = await request(app.getHttpServer())
          .post('/user')
          .send(userData);

        expect(response.statusCode).toBe(HttpStatus.BAD_REQUEST);
      });

      it(`should throw InternalServerErrorException (${HttpStatus.INTERNAL_SERVER_ERROR})`, async () => {
        const service = app.get<UserService>(UserService);
        jest.spyOn(service, 'create').mockReturnValue(throwError(new Error()));

        const response = await request(app.getHttpServer())
          .post('/user')
          .send(userData);
        expect(response.status).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
      });
    });

    describe('GET /user', () => {
      it(`should get all users (${HttpStatus.OK})`, async () => {
        const response = await request(app.getHttpServer()).get('/user');
        expect(response.status).toBe(HttpStatus.OK);
        expect(response.body).toBeDefined();
      });

      it(`should throw InternalServerErrorException (${HttpStatus.INTERNAL_SERVER_ERROR})`, async () => {
        const service = app.get<UserService>(UserService);
        jest.spyOn(service, 'findAll').mockReturnValue(throwError(new Error()));

        const response = await request(app.getHttpServer()).get('/user');
        expect(response.status).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
      });
    });

    describe('GET /user/:id', () => {
      it(`should get user by ID (${HttpStatus.OK})`, async () => {
        const response = await request(app.getHttpServer()).get(
          `/user/${user.id}`,
        );
        expect(response.status).toBe(HttpStatus.OK);
        expect(response.body).toBeDefined();
        expect(response.body.id).toBe(user.id);
      });

      it(`should throw exception if user was not found (${HttpStatus.INTERNAL_SERVER_ERROR})`, async () => {
        const wrongId: number = 999;
        const response = await request(app.getHttpServer()).get(
          `/user/${wrongId}`,
        );

        expect(response.status).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
      });

      it(`should throw InternalServerException (${HttpStatus.INTERNAL_SERVER_ERROR})`, async () => {
        const service = app.get<UserService>(UserService);
        jest.spyOn(service, 'findOne').mockReturnValue(throwError(new Error()));
        const response = await request(app.getHttpServer()).get(
          `/user/${user.id}`,
        );

        expect(response.status).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
      });
    });

    describe('PATCH /user/:id', () => {
      const edit = {
        firstName: 'Edit',
        lastName: 'Edit',
        gender: 'MALE',
        email: 'edit@gmail.com',
        password: 'abc123',
        phoneNumber: '+37368345678',
      };

      const test = {
        firstName: 123,
        lastName: '',
        gender: 'MALE',
        email: 'johndoe@gmail.com',
        password: 'q',
        phoneNumber: '+37368',
      };

      it(`should update an user (${HttpStatus.OK})`, async () => {
        const response = await request(app.getHttpServer())
          .patch(`/user/${user.id}`)
          .send(edit);

        expect(response.status).toBe(HttpStatus.OK);
        expect(response.body).toBeDefined();
        expect(response.body.firstName).toBe(edit.firstName);
      });

      it(`should throw BadRequest if fields fail the validation (${HttpStatus.BAD_REQUEST})`, async () => {
        const response = await request(app.getHttpServer())
          .patch(`/user/${user.id}`)
          .send(test);

        expect(response.statusCode).toBe(HttpStatus.BAD_REQUEST);
      });

      it(`should throw exception if user was not found (${HttpStatus.NOT_FOUND})`, async () => {
        const wrongId: number = 999;
        const response = await request(app.getHttpServer())
          .patch(`/user/${wrongId}`)
          .send(edit);

        expect(response.status).toBe(HttpStatus.NOT_FOUND);
      });

      it(`should throw InternalServerException (${HttpStatus.INTERNAL_SERVER_ERROR})`, async () => {
        const service = app.get<UserService>(UserService);

        jest.spyOn(service, 'update').mockReturnValue(throwError(new Error()));
        const response = await request(app.getHttpServer())
          .get(`/user/${user.id}`)
          .send(edit);

        expect(response.status).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
      });
    });

    describe('DELETE /user:id', () => {
      it(`should delete an user (${HttpStatus.OK})`, async () => {
        const response = await request(app.getHttpServer()).delete(
          `/user/${user.id}`,
        );
        expect(response.status).toBe(HttpStatus.OK);
      });

      it(`should throw exception if user was not found (${HttpStatus.NOT_FOUND})`, async () => {
        const wrongId: number = 999;
        const response = await request(app.getHttpServer()).delete(
          `/user/${wrongId}`,
        );
        expect(response.status).toBe(HttpStatus.NOT_FOUND);
      });

      it(`should throw InternalServerException (${HttpStatus.INTERNAL_SERVER_ERROR})`, async () => {
        const service = app.get<UserService>(UserService);

        jest.spyOn(service, 'remove').mockReturnValue(throwError(new Error()));
        const response = await request(app.getHttpServer()).delete(
          `/user/${user.id}`,
        );

        expect(response.status).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
      });
    });
  });
});
