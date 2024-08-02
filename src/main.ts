import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

async function bootstrap() {
    const app = await NestFactory.create(AppModule)

    const swaggerDocument = JSON.parse(
        fs.readFileSync(path.resolve(__dirname, '..', 'src', 'docs.json'), 'utf8')
    );

    SwaggerModule.setup('docs', app, null, {
        swaggerOptions: {
            spec: swaggerDocument,
        },
    });

    // SwaggerModule.setup('api', app, document);

    app.useGlobalPipes(new ValidationPipe())
    await app.listen(3000)
}
bootstrap()
