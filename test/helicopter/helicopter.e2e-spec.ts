import * as request from 'supertest';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { AppModule } from '../../src/app.module';
import { Test } from '@nestjs/testing';
import { throwError } from 'rxjs';
import { HelicopterService } from '../../src/module/helicopter/helicopter.service';

describe('Helicopter (e2e)', () => {
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
    let helicopter;
    let attributeHelicopter;
    let engine;
    let newEngine;

    describe('POST /helicopter', () => {
      it(`should create a helicopter (${HttpStatus.CREATED})`, async () => {
        const name: string = 'Test attribute';
        const attributeReq = await request(app.getHttpServer())
          .post('/attributes')
          .send({ name });

        expect(attributeReq.statusCode).toBe(HttpStatus.CREATED);

        const attributeHelicopterData = {
          attributeIds: [attributeReq.body.id],
          values: ['Test value'],
        };

        const attributeHelicopterReq = await request(app.getHttpServer())
          .post('/attribute-helicopter')
          .send(attributeHelicopterData);

        expect(attributeHelicopterReq.statusCode).toBe(HttpStatus.CREATED);

        const data = {
          name: 'Test Engine',
          year: 2023,
          model: 'Test Model',
          hp: 300,
        };

        const engineReq = await request(app.getHttpServer())
          .post('/engine')
          .send(data);

        expect(engineReq.statusCode).toBe(HttpStatus.CREATED);

        const helicopterData = {
          model: 'Test model',
          year: 2023,
          engineId: engineReq.body.id,
          attributeHelicopterId: attributeHelicopterReq.body.id,
        };

        const response = await request(app.getHttpServer())
          .post('/helicopter')
          .send(helicopterData);

        attributeHelicopter = attributeHelicopterReq.body;
        helicopter = response.body;
        engine = engineReq.body;
      });

      it(`should throw BadRequest if the fields fail the validation (${HttpStatus.BAD_REQUEST})`, async () => {
        const helicopterData = {
          model: '',
          year: -2023,
          engineId: engine.id,
          attributeHelicopterId: attributeHelicopter.id,
        };

        const response = await request(app.getHttpServer())
          .post('/helicopter')
          .send(helicopterData);

        expect(response.statusCode).toBe(HttpStatus.BAD_REQUEST);
      });

      it(`should throw exception if attribute helicopter is not found (${HttpStatus.INTERNAL_SERVER_ERROR})`, async () => {
        const helicopterData = {
          model: 'Test model',
          year: 2023,
          engineId: engine.id,
          attributeHelicopterId: 999,
        };

        const response = await request(app.getHttpServer())
          .post('/helicopter')
          .send(helicopterData);

        expect(response.statusCode).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
      });

      it(`should throw exception if engine is not found (${HttpStatus.INTERNAL_SERVER_ERROR})`, async () => {
        const helicopterData = {
          model: 'Test model',
          year: 2023,
          engineId: 999,
          attributeHelicopterId: attributeHelicopter.id,
        };

        const response = await request(app.getHttpServer())
          .post('/helicopter')
          .send(helicopterData);

        expect(response.statusCode).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
      });

      it(`should throw InternalServerErrorException (${HttpStatus.INTERNAL_SERVER_ERROR})`, async () => {
        const helicopterData = {
          model: 'Test model',
          year: 2023,
          engineId: engine.id,
          attributeHelicopterId: attributeHelicopter.id,
        };

        const service = app.get<HelicopterService>(HelicopterService);
        jest.spyOn(service, 'create').mockReturnValue(throwError(new Error()));

        const response = await request(app.getHttpServer())
          .post('/helicopter')
          .send(helicopterData);
        expect(response.status).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
      });
    });

    describe('GET /helicopter', () => {
      it(`should get all helicopters (${HttpStatus.OK})`, async () => {
        const response = await request(app.getHttpServer()).get('/helicopter');
        expect(response.status).toBe(HttpStatus.OK);
        expect(response.body).toBeDefined();
      });

      it(`should throw InternalServerErrorException (${HttpStatus.INTERNAL_SERVER_ERROR})`, async () => {
        const service = app.get<HelicopterService>(HelicopterService);
        jest.spyOn(service, 'findAll').mockReturnValue(throwError(new Error()));

        const response = await request(app.getHttpServer()).get('/helicopter');
        expect(response.status).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
      });
    });

    describe('GET /helicopter/:id', () => {
      it(`should get helicopter by ID (${HttpStatus.OK})`, async () => {
        const response = await request(app.getHttpServer()).get(
          `/helicopter/${helicopter.id}`,
        );
        expect(response.status).toBe(HttpStatus.OK);
        expect(response.body).toBeDefined();
        expect(response.body.id).toBe(helicopter.id);
      });

      it(`should throw exception if helicopter was not found (${HttpStatus.INTERNAL_SERVER_ERROR})`, async () => {
        const wrongId: number = 999;
        const response = await request(app.getHttpServer()).get(
          `/helicopter/${wrongId}`,
        );

        expect(response.status).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
      });

      it(`should throw InternalServerException (${HttpStatus.INTERNAL_SERVER_ERROR})`, async () => {
        const service = app.get<HelicopterService>(HelicopterService);
        jest.spyOn(service, 'findOne').mockReturnValue(throwError(new Error()));
        const response = await request(app.getHttpServer()).get(
          `/helicopter/${helicopter.id}`,
        );

        expect(response.status).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
      });
    });

    describe('PATCH /helicopter/:id', () => {
      it(`should update a helicopter (${HttpStatus.OK})`, async () => {
        const data = {
          name: 'Edit name',
          year: 2023,
          model: 'Edit model',
          hp: 300,
        };

        const engineReq = await request(app.getHttpServer())
          .post('/engine')
          .send(data);

        expect(engineReq.statusCode).toBe(HttpStatus.CREATED);
        newEngine = engineReq.body;

        const edit = {
          model: 'Edit model',
          year: 2020,
          engineId: newEngine.id,
          attributeHelicopterId: attributeHelicopter.id,
        };

        const response = await request(app.getHttpServer())
          .patch(`/helicopter/${helicopter.id}`)
          .send(edit);

        expect(response.status).toBe(HttpStatus.OK);
        expect(response.body).toBeDefined();

        expect(response.body.model).toBe(edit.model);
        expect(response.body.year).toBe(edit.year);
        expect(response.body.engine.model).toBe(data.model);
      });

      it(`should throw BadRequest if the fields fail the validation (${HttpStatus.BAD_REQUEST})`, async () => {
        const edit = {
          model: '',
          year: -2023,
          engineId: newEngine.id,
          attributeHelicopterId: attributeHelicopter.id,
        };

        const response = await request(app.getHttpServer())
          .patch(`/helicopter/${helicopter.id}`)
          .send(edit);

        expect(response.statusCode).toBe(HttpStatus.BAD_REQUEST);
      });

      it(`should throw exception if engine is not found (${HttpStatus.NOT_FOUND})`, async () => {
        const helicopterData = {
          model: 'Test model',
          year: 2023,
          engineId: 999,
          attributeHelicopterId: attributeHelicopter.id,
        };

        const response = await request(app.getHttpServer())
          .patch(`/helicopter/${helicopter.id}`)
          .send(helicopterData);

        expect(response.statusCode).toBe(HttpStatus.NOT_FOUND);
      });

      it(`should throw exception if attribute helicopter is not found (${HttpStatus.NOT_FOUND})`, async () => {
        const helicopterData = {
          model: 'Test model',
          year: 2023,
          engineId: newEngine.id,
          attributeHelicopterId: 999,
        };

        const response = await request(app.getHttpServer())
          .patch(`/helicopter/${helicopter.id}`)
          .send(helicopterData);

        expect(response.statusCode).toBe(HttpStatus.NOT_FOUND);
      });

      it(`should throw InternalServerException (${HttpStatus.INTERNAL_SERVER_ERROR})`, async () => {
        const service = app.get<HelicopterService>(HelicopterService);
        const edit = {
          model: 'Edit model',
          year: 2020,
          engineId: newEngine.id,
          attributeHelicopterId: attributeHelicopter.id,
        };

        jest.spyOn(service, 'update').mockReturnValue(throwError(new Error()));
        const response = await request(app.getHttpServer())
          .get(`/helicopter/${helicopter.id}`)
          .send(edit);

        expect(response.status).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
      });
    });

    describe('DELETE /helicopter:id', () => {
      it(`should delete a helicopter (${HttpStatus.OK})`, async () => {
        const response = await request(app.getHttpServer()).delete(
          `/helicopter/${helicopter.id}`,
        );
        expect(response.status).toBe(HttpStatus.OK);
      });

      it(`should throw exception if helicopter was not found (${HttpStatus.NOT_FOUND})`, async () => {
        const wrongId: number = 999;
        const response = await request(app.getHttpServer()).delete(
          `/helicopter/${wrongId}`,
        );
        expect(response.status).toBe(HttpStatus.NOT_FOUND);
      });

      it(`should throw InternalServerException (${HttpStatus.INTERNAL_SERVER_ERROR})`, async () => {
        const service = app.get<HelicopterService>(HelicopterService);

        jest.spyOn(service, 'remove').mockReturnValue(throwError(new Error()));
        const response = await request(app.getHttpServer()).delete(
          `/helicopter/${engine.id}`,
        );

        expect(response.status).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
      });
    });
  });
});
