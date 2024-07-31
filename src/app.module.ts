import { Module } from '@nestjs/common';
import { PostsModule } from './posts/posts.module';
import { RepliesModule } from './replies/replies.module';
import { CommunitiesModule } from './communities/communities.module';

@Module({
  imports: [PostsModule, RepliesModule, CommunitiesModule]
})
export class AppModule {}
