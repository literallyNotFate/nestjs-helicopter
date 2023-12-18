import * as request from 'supertest';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { AppModule } from '../../src/app.module';
import { Test } from '@nestjs/testing';
import { EngineService } from '../../src/module/engine/engine.service';
import { throwError } from 'rxjs';

describe('Engine (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  // it('should be defined', () => {
  //   expect(app).toBeDefined();
  // });

  describe('Endpoints', () => {
    let engine;

    describe('POST /engine', () => {
      it(`should create an engine (${HttpStatus.CREATED})`, async () => {
        const data = {
          name: 'Test Engine',
          year: 2023,
          model: 'Test Model',
          hp: 300,
        };

        const response = await request(app.getHttpServer())
          .post('/engine')
          .send(data);

        expect(response.statusCode).toBe(HttpStatus.CREATED);
        expect(response.body).toHaveProperty('id');

        expect(response.body.name).toBe(data.name);
        expect(response.body.model).toBe(data.model);
        expect(response.body.year).toBe(data.year);
        expect(response.body.hp).toBe(data.hp);

        engine = response.body;
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
          .send(data);

        expect(response.statusCode).toBe(HttpStatus.BAD_REQUEST);
      });

      it(`should throw InternalServerErrorException (${HttpStatus.INTERNAL_SERVER_ERROR})`, async () => {
        const data = {
          name: 'Test Error',
          year: 2023,
          model: 'Test Error',
          hp: 300,
        };

        const service = app.get<EngineService>(EngineService);
        jest.spyOn(service, 'create').mockReturnValue(throwError(new Error()));

        const response = await request(app.getHttpServer())
          .post('/engine')
          .send(data);
        expect(response.status).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
      });
    });

    describe('GET /engine', () => {
      it(`should get all engines (${HttpStatus.OK})`, async () => {
        const response = await request(app.getHttpServer()).get('/engine');
        expect(response.status).toBe(HttpStatus.OK);
        expect(response.body).toBeDefined();
      });

      it(`should throw InternalServerErrorException (${HttpStatus.INTERNAL_SERVER_ERROR})`, async () => {
        const service = app.get<EngineService>(EngineService);
        jest.spyOn(service, 'findAll').mockReturnValue(throwError(new Error()));

        const response = await request(app.getHttpServer()).get('/engine');
        expect(response.status).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
      });
    });

    describe('GET /engine/:id', () => {
      it(`should get engine by ID (${HttpStatus.OK})`, async () => {
        const response = await request(app.getHttpServer()).get(
          `/engine/${engine.id}`,
        );
        expect(response.status).toBe(HttpStatus.OK);
        expect(response.body).toBeDefined();
        expect(response.body.id).toBe(engine.id);
      });

      it(`should throw exception if engine was not found (${HttpStatus.INTERNAL_SERVER_ERROR})`, async () => {
        const wrongId: number = 999;
        const response = await request(app.getHttpServer()).get(
          `/engine/${wrongId}`,
        );

        expect(response.status).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
      });

      it(`should throw InternalServerException (${HttpStatus.INTERNAL_SERVER_ERROR})`, async () => {
        const service = app.get<EngineService>(EngineService);
        jest.spyOn(service, 'findOne').mockReturnValue(throwError(new Error()));
        const response = await request(app.getHttpServer()).get(
          `/engine/${engine.id}`,
        );

        expect(response.status).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
      });
    });

    describe('PATCH /engine/:id', () => {
      it(`should update an engine (${HttpStatus.OK})`, async () => {
        const edit = {
          name: 'Engine Edit',
          year: 2022,
          model: 'Model Edit',
          hp: 700,
        };

        const response = await request(app.getHttpServer())
          .patch(`/engine/${engine.id}`)
          .send(edit);

        expect(response.status).toBe(HttpStatus.OK);
        expect(response.body).toBeDefined();

        expect(response.body.name).toBe(edit.name);
        expect(response.body.model).toBe(edit.model);
        expect(response.body.year).toBe(edit.year);
        expect(response.body.hp).toBe(edit.hp);
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
          .send(edit);

        expect(response.statusCode).toBe(HttpStatus.BAD_REQUEST);
      });

      it(`should throw exception if engine was not found (${HttpStatus.NOT_FOUND})`, async () => {
        const edit = {
          name: 'Engine Edit',
          year: 2022,
          model: 'Model Edit',
          hp: 700,
        };

        const wrongId: number = 999;

        const response = await request(app.getHttpServer())
          .patch(`/engine/${wrongId}`)
          .send(edit);

        expect(response.status).toBe(HttpStatus.NOT_FOUND);
      });

      it(`should throw InternalServerException (${HttpStatus.INTERNAL_SERVER_ERROR})`, async () => {
        const service = app.get<EngineService>(EngineService);
        const edit = {
          name: 'Engine Edit',
          year: 2022,
          model: 'Model Edit',
          hp: 700,
        };

        jest.spyOn(service, 'update').mockReturnValue(throwError(new Error()));
        const response = await request(app.getHttpServer())
          .get(`/engine/${engine.id}`)
          .send(edit);

        expect(response.status).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
      });
    });

    describe('DELETE /engine:id', () => {
      it(`should delete an engine (${HttpStatus.OK})`, async () => {
        const response = await request(app.getHttpServer()).delete(
          `/engine/${engine.id}`,
        );
        expect(response.status).toBe(HttpStatus.OK);
      });

      it(`should throw exception if engine was not found (${HttpStatus.NOT_FOUND})`, async () => {
        const wrongId: number = 999;
        const response = await request(app.getHttpServer()).delete(
          `/engine/${wrongId}`,
        );
        expect(response.status).toBe(HttpStatus.NOT_FOUND);
      });

      it(`should throw InternalServerException (${HttpStatus.INTERNAL_SERVER_ERROR})`, async () => {
        const service = app.get<EngineService>(EngineService);

        jest.spyOn(service, 'remove').mockReturnValue(throwError(new Error()));
        const response = await request(app.getHttpServer()).delete(
          `/engine/${engine.id}`,
        );

        expect(response.status).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
      });
    });
  });
});
