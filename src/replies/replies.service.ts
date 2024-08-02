import { Injectable, NotFoundException, Request, UnauthorizedException } from '@nestjs/common';
import { CreateReplyDto } from './dto/create-reply.dto';
import { UpdateReplyDto } from './dto/update-reply.dto';
import mongoose, { Types } from 'mongoose';
import { InjectConnection } from '@nestjs/mongoose';
import { PostsService } from 'src/posts/posts.service';
import { RepliesRepository } from './replies.repository';

@Injectable()
export class RepliesService {
    constructor(
        private readonly repliesRepository: RepliesRepository,
        private readonly postsService: PostsService,
        @InjectConnection() private readonly connection: mongoose.Connection
    ) { }

    async create(postId: string, userId: string, content: string, parent?: string) {
        const session = await this.connection.startSession()
        try {
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
        if (filters.parent)
            return this.repliesRepository.findAll(userId, [{ $match: { parent: new Types.ObjectId(filters.parent) } }])
        if (filters.post)
            return this.repliesRepository.findAll(userId, [{ $match: { post: new Types.ObjectId(filters.post) } }])

        return this.repliesRepository.findAll(userId, [])
    }

    async findOne(id: string, userId?: string) {
        return this.repliesRepository.find(id, userId)
    }

    async update(id: string, content: string, userId: string) {
        const reply = await this.repliesRepository.find(id)

        if (!reply)
            throw new NotFoundException()

        if (reply.user != new Types.ObjectId(userId))
            throw new UnauthorizedException()

        return this.repliesRepository.update(id, content)
    }

    async remove(id: string, userId: string) {
        const session = await this.connection.startSession()
        try {
            const reply = await this.repliesRepository.delete(id, session)

            if (reply._id != new Types.ObjectId(userId))
                throw new UnauthorizedException()

            await session.commitTransaction()
        } catch {
            await session.abortTransaction()
        } finally {
            session.endSession()
        }
    }
}
