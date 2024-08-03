import { Module } from '@nestjs/common';
import { PostsService } from './posts.service';
import { PostsController } from './posts.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Post, PostSchema } from './schemas/post.schema';
import { PostScore, PostScoreSchema } from './schemas/post-score.schema';
import { PostsRepository } from './repositories/posts.repository';
import { PostScoresRepository } from './repositories/post-scores.repository';

@Module({
    imports: [
        MongooseModule.forFeature([{ name: Post.name, schema: PostSchema }, {name: PostScore.name, schema: PostScoreSchema}]),
    ],
    controllers: [PostsController],
    providers: [PostsService, PostsRepository, PostScoresRepository],
    exports: [PostsService]
})

export class PostsModule {}