import { Post } from './schemas/post.schema';
import { ForbiddenException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { PostsRepository } from './repositories/posts.repository';
import * as mongoose from 'mongoose';
import { PostScoresRepository } from './repositories/post-scores.repository';

@Injectable()
export class PostsService {
    constructor(
        private readonly postsRepository: PostsRepository,
        private readonly postScoresRepository: PostScoresRepository,
        @InjectConnection() private readonly connection: mongoose.Connection
    ) { }

    async create(userId: string, title: string, content: string) {
        return await this.postsRepository.store(
            userId,
            title,
            content
        )
    }

    async findAll(userId?: string): Promise<Post[]> {
        return this.postsRepository.findAll(userId)
    }

    async findOne(id: string, userId?: string): Promise<Post | null> {
        return this.postsRepository.find(id, userId)
    }

    async update(id: string, title: string, content: string) {
        return this.postsRepository.update(id, title, content)
    }

    async remove(id: string, userId: string) {
        const session = await this.connection.startSession()
        try {
            session.startTransaction()
            const post = await this.postsRepository.delete(id, userId)

            if (!post.user.equals(userId) || post.reply_count != 0)
                throw new ForbiddenException()

            await this.postScoresRepository.deleteAll(id)
            await session.commitTransaction()
        } catch (err) {
            await session.abortTransaction()
            throw err
        } finally {
            session.endSession()
        }
    }

    async giveScore(id: string, userId: string, score: number) {
        const session = await this.connection.startSession()
        try {
            session.startTransaction()
            const postScoreBefore = await this.postScoresRepository.addOrUpdate(id, userId, score, session)
            let scoreToUpdate = postScoreBefore ? (postScoreBefore.score * -1 + score) : score
            await this.postsRepository.incScore(id, scoreToUpdate, session)

            await session.commitTransaction()
        } catch (err) {
            await session.abortTransaction()
            throw new InternalServerErrorException()
        } finally {
            session.endSession()
        }
    }

    async deleteScore(id: string, userId: string) {
        const session = await this.connection.startSession()
        try {
            session.startTransaction()
            const score = await this.postScoresRepository.delete(id, userId)

            await this.postsRepository.incScore(id, (score.score * -1), session)

            await session.commitTransaction()
        } catch (err) {
            await session.abortTransaction()
        } finally {
            session.endSession()
        }
    }

    async incReplyCount(id: string, value: number, session?: mongoose.ClientSession) {
        return this.postsRepository.incReplyCount(id, value, session)
    }
}
