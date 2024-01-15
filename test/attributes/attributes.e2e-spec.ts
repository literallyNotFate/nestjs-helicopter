import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { AppModule } from '../../src/app.module';
import { AttributesService } from '../../src/module/attributes/attributes.service';
import { throwError } from 'rxjs';
import { RegisterDto } from '../../src/core/auth/dto';

describe('Attributes (e2e)', () => {
  let app: INestApplication;

  const userCreatorData: RegisterDto = {
    firstName: 'James',
    lastName: 'Creator',
    email: 'attributecreator@gmail.com',
    password: 'abc123',
    phoneNumber: '+37368345678',
  };

  const userOtherData: RegisterDto = {
    firstName: 'James',
    lastName: 'Other',
    email: 'attributeother@gmail.com',
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
    let attribute, creator, other;

    describe('POST /attibutes', () => {
      const name: string = 'Test attribute';

      it(`should create an attribute (${HttpStatus.CREATED})`, async () => {
        const user = await request(app.getHttpServer())
          .post('/auth/register')
          .send(userCreatorData);

        const user2 = await request(app.getHttpServer())
          .post('/auth/register')
          .send(userOtherData);

        const token = user.body.accessToken;

        const response = await request(app.getHttpServer())
          .post('/attributes')
          .set('Authorization', `Bearer ${token}`)
          .send({ name });

        expect(response.statusCode).toBe(HttpStatus.CREATED);
        expect(response.body).toHaveProperty('id');
        expect(response.body.name).toBe(name);

        attribute = response.body;
        creator = token;
        other = user2.body.accessToken;
      });

      it(`should throw UnathorizedException if user is not logged in while creating an attribute (${HttpStatus.UNAUTHORIZED})`, async () => {
        const response = await request(app.getHttpServer())
          .post('/attributes')
          .send({ name });

        expect(response.statusCode).toBe(HttpStatus.UNAUTHORIZED);
      });

      it(`should throw BadRequest if name is not a string (${HttpStatus.BAD_REQUEST})`, async () => {
        const name: number = 1;
        const response = await request(app.getHttpServer())
          .post('/attributes')
          .set('Authorization', `Bearer ${creator}`)
          .send({ name });

        expect(response.statusCode).toBe(HttpStatus.BAD_REQUEST);
      });
      it(`should throw BadRequest if name is empty (${HttpStatus.BAD_REQUEST})`, async () => {
        const name: string = '';
        const response = await request(app.getHttpServer())
          .post('/attributes')
          .set('Authorization', `Bearer ${creator}`)
          .send({ name });

        expect(response.statusCode).toBe(HttpStatus.BAD_REQUEST);
      });

      it(`should throw InternalServerErrorException (${HttpStatus.INTERNAL_SERVER_ERROR})`, async () => {
        const name: string = 'Test Error';
        const service = app.get<AttributesService>(AttributesService);
        jest.spyOn(service, 'create').mockReturnValue(throwError(new Error()));
        const response = await request(app.getHttpServer())
          .post('/attributes')
          .set('Authorization', `Bearer ${creator}`)
          .send({ name });

        expect(response.status).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
      });
    });

    describe('GET /attributes', () => {
      it(`should get all attributes (${HttpStatus.OK})`, async () => {
        const response = await request(app.getHttpServer())
          .get('/attributes')
          .set('Authorization', `Bearer ${creator}`);

        expect(response.status).toBe(HttpStatus.OK);
        expect(response.body).toBeDefined();
      });

      it(`should throw UnathorizedException if user is not logged in while getting all attributes (${HttpStatus.UNAUTHORIZED})`, async () => {
        const response = await request(app.getHttpServer()).get('/attributes');
        expect(response.statusCode).toBe(HttpStatus.UNAUTHORIZED);
      });

      it(`should throw InternalServerErrorException (${HttpStatus.INTERNAL_SERVER_ERROR})`, async () => {
        const service = app.get<AttributesService>(AttributesService);
        jest.spyOn(service, 'findAll').mockReturnValue(throwError(new Error()));

        const response = await request(app.getHttpServer())
          .get('/attributes')
          .set('Authorization', `Bearer ${creator}`);
        expect(response.status).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
      });
    });

    describe('GET /attributes/creator', () => {
      it(`should get all attributes of a creator (${HttpStatus.OK})`, async () => {
        const response = await request(app.getHttpServer())
          .get('/attributes/creator')
          .set('Authorization', `Bearer ${creator}`);

        expect(response.status).toBe(HttpStatus.OK);
        expect(response.body).toBeDefined();
      });

      it(`should throw UnathorizedException if user is not logged in while getting all attributes of a creator (${HttpStatus.UNAUTHORIZED})`, async () => {
        const response = await request(app.getHttpServer()).get(
          '/attributes/creator',
        );
        expect(response.statusCode).toBe(HttpStatus.UNAUTHORIZED);
      });

      it(`should throw InternalServerErrorException (${HttpStatus.INTERNAL_SERVER_ERROR})`, async () => {
        const service = app.get<AttributesService>(AttributesService);
        jest
          .spyOn(service, 'findAllByCreator')
          .mockReturnValue(throwError(new Error()));

        const response = await request(app.getHttpServer())
          .get('/attributes/creator')
          .set('Authorization', `Bearer ${creator}`);
        expect(response.status).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
      });
    });

    describe('GET /attributes/:id', () => {
      it(`should get attribute by ID (${HttpStatus.OK})`, async () => {
        const response = await request(app.getHttpServer())
          .get(`/attributes/${attribute.id}`)
          .set('Authorization', `Bearer ${creator}`);

        expect(response.status).toBe(HttpStatus.OK);
        expect(response.body).toBeDefined();
        expect(response.body.id).toBe(attribute.id);
      });

      it(`should throw UnathorizedException if user is not logged in while getting attribute by ID (${HttpStatus.UNAUTHORIZED})`, async () => {
        const response = await request(app.getHttpServer()).get('/attributes');
        expect(response.statusCode).toBe(HttpStatus.UNAUTHORIZED);
      });

      it(`should throw exception if attribute was not found (${HttpStatus.INTERNAL_SERVER_ERROR})`, async () => {
        const wrongId: number = 999;
        const response = await request(app.getHttpServer())
          .get(`/attributes/${wrongId}`)
          .set('Authorization', `Bearer ${creator}`);

        expect(response.status).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
      });

      it(`should throw InternalServerException (${HttpStatus.INTERNAL_SERVER_ERROR})`, async () => {
        const service = app.get<AttributesService>(AttributesService);
        jest.spyOn(service, 'findOne').mockReturnValue(throwError(new Error()));
        const response = await request(app.getHttpServer())
          .get(`/attributes/${attribute.id}`)
          .set('Authorization', `Bearer ${creator}`);

        expect(response.status).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
      });
    });

    describe('PATCH /attributes/:id', () => {
      const name: string = 'Attribute Edit';

      it(`should update an attribute (${HttpStatus.OK})`, async () => {
        const response = await request(app.getHttpServer())
          .patch(`/attributes/${attribute.id}`)
          .send({ name })
          .set('Authorization', `Bearer ${creator}`);

        expect(response.status).toBe(HttpStatus.OK);
        expect(response.body).toBeDefined();
        expect(response.body.name).toBe(name);
      });

      it(`should throw UnathorizedException if user is not logged in while updating an attribute by ID (${HttpStatus.UNAUTHORIZED})`, async () => {
        const response = await request(app.getHttpServer())
          .patch(`/attributes/${attribute.id}`)
          .send({ name });

        expect(response.statusCode).toBe(HttpStatus.UNAUTHORIZED);
      });

      it(`should throw ForbiddenException if user is not the creator of the resource (${HttpStatus.FORBIDDEN})`, async () => {
        const response = await request(app.getHttpServer())
          .patch(`/attributes/${attribute.id}`)
          .send({ name })
          .set('Authorization', `Bearer ${other}`);

        expect(response.statusCode).toBe(HttpStatus.FORBIDDEN);
      });

      it(`should throw BadRequest if name is not a string (${HttpStatus.BAD_REQUEST})`, async () => {
        const edit: number = 1;
        const response = await request(app.getHttpServer())
          .patch(`/attributes/${attribute.id}`)
          .send({ name: edit })
          .set('Authorization', `Bearer ${creator}`);

        expect(response.statusCode).toBe(HttpStatus.BAD_REQUEST);
      });

      it(`should throw BadRequest if name is empty (${HttpStatus.BAD_REQUEST})`, async () => {
        const edit: string = '';
        const response = await request(app.getHttpServer())
          .patch(`/attributes/${attribute.id}`)
          .send({ name: edit })
          .set('Authorization', `Bearer ${creator}`);

        expect(response.statusCode).toBe(HttpStatus.BAD_REQUEST);
      });

      it(`should throw InternalServerException (${HttpStatus.INTERNAL_SERVER_ERROR})`, async () => {
        const service = app.get<AttributesService>(AttributesService);

        jest.spyOn(service, 'update').mockReturnValue(throwError(new Error()));
        const response = await request(app.getHttpServer())
          .get(`/attributes/${attribute.id}`)
          .send({ name })
          .set('Authorization', `Bearer ${creator}`);

        expect(response.status).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
      });
    });

    describe('DELETE /attributes:id', () => {
      it(`should delete an attribute (${HttpStatus.OK})`, async () => {
        const response = await request(app.getHttpServer())
          .delete(`/attributes/${attribute.id}`)
          .set('Authorization', `Bearer ${creator}`);

        expect(response.status).toBe(HttpStatus.OK);
      });

      it(`should throw UnathorizedException if user is not logged in while deleting an attribute by ID (${HttpStatus.UNAUTHORIZED})`, async () => {
        const response = await request(app.getHttpServer()).delete(
          `/attributes/${attribute.id}`,
        );

        expect(response.statusCode).toBe(HttpStatus.UNAUTHORIZED);
      });

      it(`should throw ForbiddenException if user is not the creator of the resource (${HttpStatus.FORBIDDEN})`, async () => {
        const response = await request(app.getHttpServer())
          .delete(`/attributes/${attribute.id}`)
          .set('Authorization', `Bearer ${other}`);

        expect(response.statusCode).toBe(HttpStatus.FORBIDDEN);
      });

      it(`should throw InternalServerException (${HttpStatus.INTERNAL_SERVER_ERROR})`, async () => {
        const service = app.get<AttributesService>(AttributesService);

        jest.spyOn(service, 'remove').mockReturnValue(throwError(new Error()));
        const response = await request(app.getHttpServer())
          .delete(`/attributes/${attribute.id}`)
          .set('Authorization', `Bearer ${creator}`);

        expect(response.status).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
      });
    });
  });
});
