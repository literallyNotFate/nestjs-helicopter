import * as request from 'supertest';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { AppModule } from '../../src/app.module';
import { Test } from '@nestjs/testing';
import { EngineService } from '../../src/module/engine/engine.service';
import { throwError } from 'rxjs';
import { RegisterDto } from '../../src/core/auth/dto';

describe('Engine (e2e)', () => {
  let app: INestApplication;

  const userCreatorData: RegisterDto = {
    firstName: 'James',
    lastName: 'Creator',
    email: 'enginecreator@gmail.com',
    password: 'abc123',
    phoneNumber: '+37368345678',
  };

  const userOtherData: RegisterDto = {
    firstName: 'James',
    lastName: 'Other',
    email: 'engineother@gmail.com',
    password: 'abc123',
    phoneNumber: '+37368345678',
  };

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
    let engine, creator, other;

    describe('POST /engine', () => {
      const data = {
        name: 'Test Engine',
        year: 2023,
        model: 'Test Model',
        hp: 300,
      };

      it(`should create an engine (${HttpStatus.CREATED})`, async () => {
        const user = await request(app.getHttpServer())
          .post('/auth/register')
          .send(userCreatorData);

        const user2 = await request(app.getHttpServer())
          .post('/auth/register')
          .send(userOtherData);

        const token = user.body.accessToken;

        const response = await request(app.getHttpServer())
          .post('/engine')
          .set('Authorization', `Bearer ${token}`)
          .send(data);

        expect(response.statusCode).toBe(HttpStatus.CREATED);
        expect(response.body).toHaveProperty('id');

        expect(response.body.name).toBe(data.name);
        expect(response.body.model).toBe(data.model);
        expect(response.body.year).toBe(data.year);
        expect(response.body.hp).toBe(data.hp);

        engine = response.body;
        creator = token;
        other = user2.body.accessToken;
      });

      it(`should throw UnathorizedException if user is not logged in while creating an engine (${HttpStatus.UNAUTHORIZED})`, async () => {
        const response = await request(app.getHttpServer())
          .post('/engine')
          .send(data);

        expect(response.statusCode).toBe(HttpStatus.UNAUTHORIZED);
      });

      it(`should throw BadRequest if the fields fail the validation (${HttpStatus.BAD_REQUEST})`, async () => {
        const data = {
          name: 1000,
          year: -2023,
          model: '',
          hp: '300',
        };

        const response = await request(app.getHttpServer())
          .post('/engine')
          .set('Authorization', `Bearer ${creator}`)
          .send(data);

        expect(response.statusCode).toBe(HttpStatus.BAD_REQUEST);
      });

      it(`should throw InternalServerErrorException (${HttpStatus.INTERNAL_SERVER_ERROR})`, async () => {
        const service = app.get<EngineService>(EngineService);
        jest.spyOn(service, 'create').mockReturnValue(throwError(new Error()));

        const response = await request(app.getHttpServer())
          .post('/engine')
          .set('Authorization', `Bearer ${creator}`)
          .send(data);

        expect(response.status).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
      });
    });

    describe('GET /engine', () => {
      it(`should get all engines (${HttpStatus.OK})`, async () => {
        const response = await request(app.getHttpServer())
          .get('/engine')
          .set('Authorization', `Bearer ${creator}`);
        expect(response.status).toBe(HttpStatus.OK);
        expect(response.body).toBeDefined();
      });

      it(`should throw UnathorizedException if user is not logged in while getting all engines (${HttpStatus.UNAUTHORIZED})`, async () => {
        const response = await request(app.getHttpServer()).get('/engine');
        expect(response.statusCode).toBe(HttpStatus.UNAUTHORIZED);
      });

      it(`should throw InternalServerErrorException (${HttpStatus.INTERNAL_SERVER_ERROR})`, async () => {
        const service = app.get<EngineService>(EngineService);
        jest.spyOn(service, 'findAll').mockReturnValue(throwError(new Error()));

        const response = await request(app.getHttpServer())
          .get('/engine')
          .set('Authorization', `Bearer ${creator}`);
        expect(response.status).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
      });
    });

    describe('GET /engine/creator', () => {
      it(`should get all engines of a creator (${HttpStatus.OK})`, async () => {
        const response = await request(app.getHttpServer())
          .get('/engine/creator')
          .set('Authorization', `Bearer ${creator}`);
        expect(response.status).toBe(HttpStatus.OK);
        expect(response.body).toBeDefined();
      });

      it(`should throw UnathorizedException if user is not logged in while getting all engines of a creator (${HttpStatus.UNAUTHORIZED})`, async () => {
        const response = await request(app.getHttpServer()).get(
          '/engine/creator',
        );
        expect(response.statusCode).toBe(HttpStatus.UNAUTHORIZED);
      });

      it(`should throw InternalServerErrorException (${HttpStatus.INTERNAL_SERVER_ERROR})`, async () => {
        const service = app.get<EngineService>(EngineService);
        jest
          .spyOn(service, 'findAllByCreator')
          .mockReturnValue(throwError(new Error()));

        const response = await request(app.getHttpServer())
          .get('/engine/creator')
          .set('Authorization', `Bearer ${creator}`);
        expect(response.status).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
      });
    });

    describe('GET /engine/:id', () => {
      it(`should get engine by ID (${HttpStatus.OK})`, async () => {
        const response = await request(app.getHttpServer())
          .get(`/engine/${engine.id}`)
          .set('Authorization', `Bearer ${creator}`);

        expect(response.status).toBe(HttpStatus.OK);
        expect(response.body).toBeDefined();
        expect(response.body.id).toBe(engine.id);
      });

      it(`should throw UnathorizedException if user is not logged in while getting engine by ID (${HttpStatus.UNAUTHORIZED})`, async () => {
        const response = await request(app.getHttpServer()).get(
          `/engine/${engine.id}`,
        );
        expect(response.statusCode).toBe(HttpStatus.UNAUTHORIZED);
      });

      it(`should throw exception if engine was not found (${HttpStatus.INTERNAL_SERVER_ERROR})`, async () => {
        const wrongId: number = 999;
        const response = await request(app.getHttpServer())
          .get(`/engine/${wrongId}`)
          .set('Authorization', `Bearer ${creator}`);

        expect(response.status).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
      });

      it(`should throw InternalServerException (${HttpStatus.INTERNAL_SERVER_ERROR})`, async () => {
        const service = app.get<EngineService>(EngineService);
        jest.spyOn(service, 'findOne').mockReturnValue(throwError(new Error()));
        const response = await request(app.getHttpServer())
          .get(`/engine/${engine.id}`)
          .set('Authorization', `Bearer ${creator}`);

        expect(response.status).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
      });
    });

    describe('PATCH /engine/:id', () => {
      const edit = {
        name: 'Engine Edit',
        year: 2022,
        model: 'Model Edit',
        hp: 700,
      };

      it(`should update an engine (${HttpStatus.OK})`, async () => {
        const response = await request(app.getHttpServer())
          .patch(`/engine/${engine.id}`)
          .set('Authorization', `Bearer ${creator}`)
          .send(edit);

        expect(response.status).toBe(HttpStatus.OK);
        expect(response.body).toBeDefined();

        expect(response.body.name).toBe(edit.name);
        expect(response.body.model).toBe(edit.model);
        expect(response.body.year).toBe(edit.year);
        expect(response.body.hp).toBe(edit.hp);
      });

      it(`should throw UnathorizedException if user is not logged in while updating an engine by ID (${HttpStatus.UNAUTHORIZED})`, async () => {
        const response = await request(app.getHttpServer())
          .patch(`/engine/${engine.id}`)
          .send(edit);

        expect(response.statusCode).toBe(HttpStatus.UNAUTHORIZED);
      });

      it(`should throw ForbiddenException if user is not the creator of the resource (${HttpStatus.FORBIDDEN})`, async () => {
        const response = await request(app.getHttpServer())
          .patch(`/engine/${engine.id}`)
          .send(edit)
          .set('Authorization', `Bearer ${other}`);

        expect(response.statusCode).toBe(HttpStatus.FORBIDDEN);
      });

      it(`should throw BadRequest if the fields fail the validation (${HttpStatus.BAD_REQUEST})`, async () => {
        const edit = {
          name: 1000,
          year: -2023,
          model: '',
          hp: '300',
        };

        const response = await request(app.getHttpServer())
          .patch(`/engine/${engine.id}`)
          .send(edit)
          .set('Authorization', `Bearer ${creator}`);

        expect(response.statusCode).toBe(HttpStatus.BAD_REQUEST);
      });

      it(`should throw InternalServerException (${HttpStatus.INTERNAL_SERVER_ERROR})`, async () => {
        const service = app.get<EngineService>(EngineService);

        jest.spyOn(service, 'update').mockReturnValue(throwError(new Error()));
        const response = await request(app.getHttpServer())
          .patch(`/engine/${engine.id}`)
          .set('Authorization', `Bearer ${creator}`)
          .send(edit);

        expect(response.status).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
      });
    });

    describe('DELETE /engine:id', () => {
      it(`should delete an engine (${HttpStatus.OK})`, async () => {
        const response = await request(app.getHttpServer())
          .delete(`/engine/${engine.id}`)
          .set('Authorization', `Bearer ${creator}`);
        expect(response.status).toBe(HttpStatus.OK);
      });

      it(`should throw UnathorizedException if user is not logged in while deleting an engine by ID (${HttpStatus.UNAUTHORIZED})`, async () => {
        const response = await request(app.getHttpServer()).delete(
          `/engine/${engine.id}`,
        );

        expect(response.statusCode).toBe(HttpStatus.UNAUTHORIZED);
      });

      it(`should throw ForbiddenException if user is not the creator of the resource (${HttpStatus.FORBIDDEN})`, async () => {
        const response = await request(app.getHttpServer())
          .delete(`/engine/${engine.id}`)
          .set('Authorization', `Bearer ${other}`);

        expect(response.statusCode).toBe(HttpStatus.FORBIDDEN);
      });

      it(`should throw InternalServerException (${HttpStatus.INTERNAL_SERVER_ERROR})`, async () => {
        const service = app.get<EngineService>(EngineService);

        jest.spyOn(service, 'remove').mockReturnValue(throwError(new Error()));
        const response = await request(app.getHttpServer())
          .delete(`/engine/${engine.id}`)
          .set('Authorization', `Bearer ${creator}`);

        expect(response.status).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
      });
    });
  });
});
