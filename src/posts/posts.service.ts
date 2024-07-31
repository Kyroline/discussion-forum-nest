import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { Post } from './schemas/post.schema';
import { Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { PostRepository } from './posts.repository';
import { Connection, ClientSession, UpdateWriteOpResult } from 'mongoose';
import { GiveScoreDto } from './dto/give-score.dto';

@Injectable()
export class PostsService {
    constructor(private readonly postRepository: PostRepository) { }

    async create(createPostDto: CreatePostDto) {
        return this.postRepository.store(
            createPostDto.community_id,
            '',
            createPostDto.title,
            createPostDto.content
        )
    }

    async findAll(): Promise<Post[]> {
        return this.postRepository.findAll()
    }

    async findOne(id: string): Promise<Post | null> {
        return this.postRepository.find(id)
    }

    async update(id: string, updatePostDto: UpdatePostDto): Promise<UpdateWriteOpResult> {
        return this.postRepository.update(id, updatePostDto.title, updatePostDto.content)
    }

    async remove(id: string) {
        return `This action removes a #${id} post`;
    }

    async giveScore(id: string, userId: string, giveScoreDto: GiveScoreDto) {
        return Promise.all([this.postRepository.setPostScore(id, userId, giveScoreDto.score), this.postRepository.incScore(id, giveScoreDto.score)])
    }

    async deleteScore(id: string, userId: string) {
        return this.postRepository.deletePostScore(id, userId)
    }
}
