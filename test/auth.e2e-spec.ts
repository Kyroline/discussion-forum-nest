import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { ConfigModule } from '@nestjs/config';
import mongoose from 'mongoose';
import { getConnectionToken, MongooseModule } from '@nestjs/mongoose';


describe('AuthIntegration (e2e)', () => {
    let app: INestApplication;
    let token: string[] = []
    let post: string[] = []
    let reply: string[] = []

    beforeEach(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [
                ConfigModule.forRoot(),
                MongooseModule.forRoot(process.env.MONGOOSE_TEST_CONN),
                AppModule,
            ],
        }).compile();

        app = moduleFixture.createNestApplication();
        app.useGlobalPipes(new ValidationPipe())
        await app.init();
    });

    it('/auth/register (POST) registrasi harus mengembalikan access_token', async () => {
        const response = await request(app.getHttpServer())
            .post('/auth/register')
            .send({
                username: 'Kyroline',
                email: 'rwd.3.14159@gmail.com',
                password: 'secret',
            })
            .expect(200);

        token.push(response.body.access_token)

        expect(response.body).toHaveProperty('access_token');

        const response2 = await request(app.getHttpServer())
            .post('/auth/register')
            .send({
                username: 'Kyline',
                email: 'rwd9@gmail.com',
                password: 'secret',
            })
            .expect(200);

        token.push(response2.body.access_token)

        expect(response2.body).toHaveProperty('access_token');
    });

    it('/auth/register (POST) konflik pada username atau email harus CONFLICT', async () => {
        const response = await request(app.getHttpServer())
            .post('/auth/register')
            .send({
                username: 'Kyroline',
                email: 'rwd.3.14159@gmail.com',
                password: 'secret',
            })
            .expect(409);
    });

    it('/auth/register (POST) kesalahan penulisan request harus BAD REQUEST', async () => {
        const response = await request(app.getHttpServer())
            .post('/auth/register')
            .send({
                email: 'rwd.3.14159gmail.com',
                password: 'secret',
            })
            .expect(400);
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

    it('/auth/login (POST) kredensial salah harus UNAUTHORIZED', async () => {
        const response = await request(app.getHttpServer())
            .post('/auth/login')
            .send({
                email: 'rwd.3.14159@gmail.com',
                password: 'aaaaaa',
            })
            .expect(401);
    });

    it('/auth/login (POST) bentuk data salah harus BAD REQUEST', async () => {
        const response = await request(app.getHttpServer())
            .post('/auth/login')
            .send({
                email: 'rwd.3.14159gail.com',
                password: 'aaaaaa',
            })
            .expect(400);
    })

    it('/posts (POST) tidak ada token harus UNAUTHORIZED', async () => {
        const response = await request(app.getHttpServer())
            .post('/posts')
            .expect(401);
    })

    it('/posts (POST) pembuatan post benar harus CREATED', async () => {
        const response = await request(app.getHttpServer())
            .post('/posts')
            .set('Authorization', `Bearer ${token[0]}`)
            .send({
                title: 'Judul POST',
                content: 'Content BODY'
            })
            .expect(201);
    })

    it('/posts (GET) walaupun tidak ada token harus OK', async () => {
        const response = await request(app.getHttpServer())
            .get('/posts')
            .expect(200);
    })

    it('/posts (GET) ada token harus OK', async () => {
        const response = await request(app.getHttpServer())
            .get('/posts')
            .set('Authorization', `Bearer ${token[0]}`)
            .expect(200);

        post.push(response.body[0]._id)
    })

    it('/posts/${id}/score (POST) tidak ada token harus UNAUTHORIZED', async () => {
        const response = await request(app.getHttpServer())
            .post(`/posts/${post[0]}/score`)
            .expect(401);
    })

    it('/posts/${id}/score (POST) ada token harus CREATED', async () => {
        const response = await request(app.getHttpServer())
            .post(`/posts/${post[0]}/score`)
            .set('Authorization', `Bearer ${token[0]}`)
            .send({ score: 1 })
            .expect(201);
    })

    it('/posts/${id}/score (DELETE) tidak ada token harus UNAUTHORIZED', async () => {
        const response = await request(app.getHttpServer())
            .delete(`/posts/${post[0]}/score`)
            .expect(401);
    })

    it('/posts/${id}/score (DELETE) ada token harus CREATED', async () => {
        const response = await request(app.getHttpServer())
            .delete(`/posts/${post[0]}/score`)
            .set('Authorization', `Bearer ${token[0]}`)
            .expect(200);
    })

    it('/posts (PATCH) edit post tapi bukan creator post harus FORBIDDEN', async () => {
        const response = await request(app.getHttpServer())
            .patch(`/posts/${post[0]}`)
            .set('Authorization', `Bearer ${token[1]}`)
            .send({
                title: 'Judul POST',
                content: 'Content BODY'
            })
            .expect(403);
    })

    it('/posts (PATCH) edit post dengan benar harus OK', async () => {
        const response = await request(app.getHttpServer())
            .patch(`/posts/${post[0]}`)
            .set('Authorization', `Bearer ${token[0]}`)
            .send({
                title: 'Judul POST',
                content: 'Content BODY'
            })
            .expect(200);
    })

    it('/replies (POST) pembuatan reply benar harus CREATED', async () => {
        const response = await request(app.getHttpServer())
            .post('/replies')
            .set('Authorization', `Bearer ${token[0]}`)
            .send({
                post_id: post[0],
                content: 'Content BODY'
            })
            .expect(201);
    })

    it('/replies (POST) pembuatan reply tanpa token harus UNAUTHORIZED', async () => {
        const response = await request(app.getHttpServer())
            .post('/replies')
            .send({
                post_id: reply[0],
                content: 'Content BODY'
            })
            .expect(401);
    })

    it('/replies (GET) walaupun tidak ada token harus OK', async () => {
        const response = await request(app.getHttpServer())
            .get('/replies')
            .expect(200);
    })

    it('/replies (GET) ada token harus OK', async () => {
        const response = await request(app.getHttpServer())
            .get('/replies')
            .set('Authorization', `Bearer ${token[0]}`)
            .expect(200);

        reply.push(response.body[0]._id)
    })

    it('/replies (PATCH) edit post tapi bukan creator post harus FORBIDDEN', async () => {
        const response = await request(app.getHttpServer())
            .patch(`/replies/${reply[0]}`)
            .set('Authorization', `Bearer ${token[1]}`)
            .send({
                content: 'Content BODY'
            })
            .expect(403);
    })

    it('/replies (PATCH) edit post dengan benar harus OK', async () => {
        const response = await request(app.getHttpServer())
            .patch(`/replies/${reply[0]}`)
            .set('Authorization', `Bearer ${token[0]}`)
            .send({
                content: 'Content BODY'
            })
            .expect(200);
    })

    it('/replies/${id}/score (POST) tidak ada token harus UNAUTHORIZED', async () => {
        const response = await request(app.getHttpServer())
            .post(`/replies/${reply[0]}/score`)
            .expect(401);
    })

    it('/replies/${id}/score (POST) ada token harus CREATED', async () => {
        const response = await request(app.getHttpServer())
            .post(`/replies/${reply[0]}/score`)
            .set('Authorization', `Bearer ${token[0]}`)
            .send({ score: 1 })
            .expect(201);
    })

    it('/replies/${id}/score (DELETE) tidak ada token harus UNAUTHORIZED', async () => {
        const response = await request(app.getHttpServer())
            .delete(`/replies/${reply[0]}/score`)
            .expect(401);
    })

    it('/replies/${id}/score (DELETE) ada token harus CREATED', async () => {
        const response = await request(app.getHttpServer())
            .delete(`/replies/${reply[0]}/score`)
            .set('Authorization', `Bearer ${token[0]}`)
            .expect(200);
    })

    it('/replies/${id} (DELETE) tidak ada token harus UNAUTHORIZED', async () => {
        const response = await request(app.getHttpServer())
            .delete(`/replies/${reply[0]}`)
            .expect(401);
    })

    it('/replies/${id} (DELETE) tapi bukan creator post harus FORBIDDEN', async () => {
        const response = await request(app.getHttpServer())
            .delete(`/replies/${reply[0]}`)
            .set('Authorization', `Bearer ${token[1]}`)
            .expect(403);
    })

    it('/replies/${id} (DELETE) ada token harus OK', async () => {
        const response = await request(app.getHttpServer())
            .delete(`/replies/${reply[0]}`)
            .set('Authorization', `Bearer ${token[0]}`)
            .expect(200);
    })

    it('/posts/${id} (DELETE) tidak ada token harus UNAUTHORIZED', async () => {
        const response = await request(app.getHttpServer())
            .delete(`/posts/${post[0]}`)
            .expect(401);
    })

    it('/posts/${id} (DELETE) tapi bukan creator post harus FORBIDDEN', async () => {
        const response = await request(app.getHttpServer())
            .delete(`/posts/${post[0]}`)
            .set('Authorization', `Bearer ${token[1]}`)
            .expect(403);
    })

    it('/posts/${id} (DELETE) ada token harus CREATED', async () => {
        const response = await request(app.getHttpServer())
            .delete(`/posts/${post[0]}`)
            .set('Authorization', `Bearer ${token[0]}`)
            .expect(200);
    })

    beforeAll(async () => {
        await mongoose.connect(process.env.MONGOOSE_TEST_CONN);
        await mongoose.connection.db.dropDatabase();
    });

    afterAll(async () => {
        await mongoose.disconnect();
        await app.close();
    });
});
