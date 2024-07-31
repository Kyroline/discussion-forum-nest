import { Injectable } from "@nestjs/common";
import { InjectModel } from '@nestjs/mongoose';
import { ClientSession, Model, Types } from 'mongoose';
import { Post } from './schemas/post.schema';
import { PostScore } from "./schemas/post-score.schema";
import { populateCommunity, populateUser } from "./posts.aggregation";

@Injectable()
export class PostRepository {
    constructor(
        @InjectModel(Post.name) private readonly postModel: Model<Post>,
        @InjectModel(PostScore.name) private readonly postScoreModel: Model<PostScore>
    ) { }

    async findAll(): Promise<Post[]> {
        return this.postModel.aggregate([
            ...populateCommunity(),
            ...populateUser(),
        ]).exec()
    }

    async find(postId: string): Promise<Post | null> {
        return this.postModel.aggregate([
            { $match: { id: new Types.ObjectId(postId) } },
            ...populateCommunity(),
            ...populateUser()
        ]).exec().then(res => res ? res[0] : null)
    }

    async store(communityId: string | null, userId: string, title: string, content: string, session?: ClientSession) {
        return this.postModel.create([{
            community: communityId ?? null,
            user: userId,
            title: title,
            content: content,
            score: 0,
            reply_count: 0
        }], session ? { session } : {}).then(res => res[0])
    }

    async update(postId: string, title: string, content: string, session?: ClientSession) {
        return this.postModel.updateOne({ _id: postId }, { title: title, content: content }, session ? { session } : {})
    }

    async incScore(postId: string, score: number, session?: ClientSession) {
        return this.postModel.updateOne({ _id: postId }, { $set: { score: { $inc: score } } }, session ? { session } : {})
    }

    async setPostScore(postId: string, userId: string, score: number, session?: ClientSession) {
        return this.postScoreModel.updateOne({ post: postId, user: userId }, { score: score }, { upsert: true, session: session ? session : null })
    }

    async deletePostScore(postId: string, userId: string, session?: ClientSession) {
        return this.postScoreModel.deleteOne({ post: postId, user: userId }, session ? { session } : {})
    }
}