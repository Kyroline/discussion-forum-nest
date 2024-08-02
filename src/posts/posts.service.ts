import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { Post } from './schemas/post.schema';
import { Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { PostsRepository } from './posts.repository';
import * as mongoose from 'mongoose';
import { GiveScoreDto } from './dto/give-score.dto';

@Injectable()
export class PostsService {
    constructor(
        private readonly postsRepository: PostsRepository,
        @InjectConnection() private readonly connection: mongoose.Connection
    ) { }

    async create(userId: string, createPostDto: CreatePostDto) {
        return this.postsRepository.store(
            userId,
            createPostDto.title,
            createPostDto.content
        )
    }

    async findAll(userId?: string | null): Promise<Post[]> {
        return this.postsRepository.findAll(userId)
    }

    async findOne(id: string, userId?: string | null): Promise<Post | null> {
        return this.postsRepository.find(id, userId)
    }

    async update(id: string, updatePostDto: UpdatePostDto): Promise<mongoose.UpdateWriteOpResult> {
        return this.postsRepository.update(id, updatePostDto.title, updatePostDto.content)
    }

    async remove(id: string) {
        try {
            const post = await this.postsRepository.delete(id)
        } catch (error) {

        }
    }

    async giveScore(id: string, userId: string, score: number) {
        const session = await this.connection.startSession()
        try {
            await this.postsRepository.setPostScore(id, userId, score)
            await this.postsRepository.incScore(id, score)

            await session.commitTransaction()
        } catch {
            await session.abortTransaction()
        } finally {
            session.endSession()
        }
    }

    async deleteScore(id: string, userId: string) {
        const session = await this.connection.startSession()
        try {
            const score = await this.postsRepository.deletePostScore(id, userId)
            await this.postsRepository.incScore(id, score.score * -1, session)

            await session.commitTransaction()
        } catch {
            await session.abortTransaction()
        } finally {
            session.endSession()
        }
    }

    async incReplyCount(id: string, value: number, session?: mongoose.ClientSession) {
        return this.postsRepository.incReplyCount(id, value, session)
    }
}
