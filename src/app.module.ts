import { Module } from '@nestjs/common';
import { PostsModule } from './posts/posts.module';
import { RepliesModule } from './replies/replies.module';
import { CommunitiesModule } from './communities/communities.module';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';

@Module({
    imports: [
        ConfigModule.forRoot(),
        PostsModule,
        RepliesModule,
        CommunitiesModule,
        MongooseModule.forRoot(process.env.MONGOOSE_CONN)
    ],
})
export class AppModule { }
