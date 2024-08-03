import { Module } from '@nestjs/common';
import { PostsModule } from './posts/posts.module';
import { RepliesModule } from './replies/replies.module';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';

@Module({
    imports: [
        ConfigModule.forRoot(),
        PostsModule,
        RepliesModule,
        MongooseModule.forRoot(process.env.MONGOOSE_CONN),
        AuthModule,
        UsersModule
    ],
})
export class AppModule { }
