import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { Post } from './schemas/post.schema';
import { Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { PostsRepository } from './posts.repository';
import { Connection, ClientSession, UpdateWriteOpResult } from 'mongoose';
import { GiveScoreDto } from './dto/give-score.dto';

@Injectable()
export class PostsService {
    constructor(private readonly postsRepository: PostsRepository) { }

    async create(createPostDto: CreatePostDto) {
        return this.postsRepository.store(
            createPostDto.community_id,
            '',
            createPostDto.title,
            createPostDto.content
        )
    }

    async findAll(): Promise<Post[]> {
        return this.postsRepository.findAll()
    }

    async findOne(id: string): Promise<Post | null> {
        return this.postsRepository.find(id)
    }

    async update(id: string, updatePostDto: UpdatePostDto): Promise<UpdateWriteOpResult> {
        return this.postsRepository.update(id, updatePostDto.title, updatePostDto.content)
    }

    async remove(id: string) {
        return `This action removes a #${id} post`;
    }

    async giveScore(id: string, userId: string, giveScoreDto: GiveScoreDto) {
        return Promise.all([this.postsRepository.setPostScore(id, userId, giveScoreDto.score), this.postsRepository.incScore(id, giveScoreDto.score)])
    }

    async deleteScore(id: string, userId: string) {
        return this.postsRepository.deletePostScore(id, userId)
    }
}
