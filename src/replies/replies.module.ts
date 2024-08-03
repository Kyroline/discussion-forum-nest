import { Module } from '@nestjs/common';
import { RepliesService } from './replies.service';
import { RepliesController } from './replies.controller';
import { PostsModule } from '../posts/posts.module';
import { RepliesRepository } from './repositories/replies.repository';
import { Reply, ReplySchema } from './schemas/reply.schema';
import { ReplyScore, ReplyScoreSchema } from './schemas/reply-score.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { ReplyScoresRepository } from './repositories/reply-scores.repository';

@Module({
    imports: [
        PostsModule,
        MongooseModule.forFeature([{ name: Reply.name, schema: ReplySchema }, { name: ReplyScore.name, schema: ReplyScoreSchema }]),

    ],
    controllers: [RepliesController],
    providers: [RepliesService, RepliesRepository, ReplyScoresRepository],
    exports: [RepliesModule]
})
export class RepliesModule { }
