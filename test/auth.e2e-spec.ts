import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { getConnectionToken } from '@nestjs/mongoose';

describe('AuthController (e2e)', () => {
    let app: INestApplication;

    beforeEach(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        app.useGlobalPipes(new ValidationPipe())
        await app.init();
    });

    it('/auth/login (POST) kredensial benar harus ada access_token', async () => {
        const response = await request(app.getHttpServer())
            .post('/auth/login')
            .send({
                email: 'rwd.3.14159@gmail.com',
                password: 'secret',
            })
            .expect(200);

        expect(response.body).toHaveProperty('access_token');
    });

    it('/auth/login (POST) kredensial salah harus unauthorized', async () => {
        const response = await request(app.getHttpServer())
            .post('/auth/login')
            .send({
                email: 'rwd.3.14159@gmail.com',
                password: 'aaaaaa',
            })
            .expect(401);
    });

    it('/auth/login (POST) bentuk data salah harus bad request', async () => {
        const response = await request(app.getHttpServer())
            .post('/auth/login')
            .send({
                email: 'rwd.3.14159gail.com',
                password: 'aaaaaa',
            })
            .expect(400);
    });

    afterAll(async () => {
        const connection = app.get(getConnectionToken())
        await connection.dropDatabase()
        await app.close();
      });
});
