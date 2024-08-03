import { ForbiddenException, Injectable, InternalServerErrorException, NotFoundException, Request, UnauthorizedException } from '@nestjs/common';
import mongoose, { Types } from 'mongoose';
import { InjectConnection } from '@nestjs/mongoose';
import { PostsService } from '../posts/posts.service';
import { RepliesRepository } from './repositories/replies.repository';
import { ReplyScoresRepository } from './repositories/reply-scores.repository';

@Injectable()
export class RepliesService {
    constructor(
        private readonly repliesRepository: RepliesRepository,
        private readonly replyScoresRepository: ReplyScoresRepository,
        private postsService: PostsService,
        @InjectConnection() private readonly connection: mongoose.Connection
    ) { }

    async create(postId: string, userId: string, content: string, parent?: string) {
        const session = await this.connection.startSession()
        try {
            session.startTransaction()
            const reply = await this.repliesRepository.store(postId, userId, content, parent, session)

            await this.postsService.incReplyCount(postId, 1, session)

            if (parent)
                await this.repliesRepository.incReplyCount(reply._id.toString(), 1, session)

            await session.commitTransaction()
        } catch {
            await session.abortTransaction()
        } finally {
            session.endSession()
        }
    }

    async findAll(userId?: string, filters?: { parent?: string, post?: string }) {
        if (filters) {
            if (filters.parent)
                return this.repliesRepository.findAll(userId, [{ $match: { parent: new Types.ObjectId(filters.parent) } }])
            if (filters.post)
                return this.repliesRepository.findAll(userId, [{ $match: { post: new Types.ObjectId(filters.post) } }])
        }

        return this.repliesRepository.findAll(userId, [])
    }

    async findOne(id: string, userId?: string) {
        return this.repliesRepository.find(id, userId)
    }

    async update(id: string, content: string, userId: string) {
        const reply = await this.repliesRepository.find(id)

        if (!reply)
            throw new NotFoundException()

        if (!reply.user._id.equals(userId))
            throw new ForbiddenException()

        return this.repliesRepository.update(id, content)
    }

    async remove(id: string, userId: string) {
        const session = await this.connection.startSession()
        try {
            session.startTransaction()
            const reply = await this.repliesRepository.delete(id, session)

            if (!reply.user.equals(userId) || reply.reply_count != 0) {
                throw new ForbiddenException()
            }

            await this.replyScoresRepository.deleteAll(reply.post.toString(), session)
            await this.postsService.incReplyCount(reply.post.toString(), -1, session)

            if (reply.parent)
                await this.repliesRepository.incReplyCount(reply.parent.toString(), -1, session)

            await session.commitTransaction()
        } catch (error) {
            console.log(error)
            await session.abortTransaction()
            throw error
        } finally {
            session.endSession()
        }
    }

    async giveScore(id: string, userId: string, score: number) {
        const session = await this.connection.startSession()
        try {
            session.startTransaction()
            const postScoreBefore = await this.replyScoresRepository.addOrUpdate(id, userId, score, session)
            let scoreToUpdate = postScoreBefore ? (postScoreBefore.score * -1 + score) : score
            await this.repliesRepository.incScore(id, scoreToUpdate, session)

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
            const score = await this.replyScoresRepository.delete(id, userId, session)

            await this.repliesRepository.incScore(id, (score.score * -1), session)

            await session.commitTransaction()
        } catch (err) {
            console.log(err)
            await session.abortTransaction()
        } finally {
            session.endSession()
        }
    }

    async incReplyCount(id: string, value: number, session?: mongoose.ClientSession) {
        return this.repliesRepository.incReplyCount(id, value, session)
    }
}
