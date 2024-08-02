import { Injectable } from "@nestjs/common";
import { InjectModel } from '@nestjs/mongoose';
import { ClientSession, Model, PipelineStage, Types } from 'mongoose';
import { Post, PostDocument } from './schemas/post.schema';
import { PostScore } from "./schemas/post-score.schema";
import { checkIfUserGiveScore, populateUser } from "./posts.aggregation";

@Injectable()
export class PostsRepository {
    constructor(
        @InjectModel(Post.name) private readonly postModel: Model<Post>,
        @InjectModel(PostScore.name) private readonly postScoreModel: Model<PostScore>
    ) { }

    async findAll(userId?: string | null): Promise<Post[]> {
        return this.postModel.aggregate([
            ...populateUser(),
            ...(userId ? checkIfUserGiveScore(userId) : [])
        ]).exec()
    }

    async find(postId: string, userId?: string | null): Promise<Post | null> {
        return this.postModel.aggregate([
            { $match: { _id: new Types.ObjectId(postId) } },
            ...populateUser(),
            ...(userId ? checkIfUserGiveScore(userId) : [])
        ]).exec().then(res => res ? res[0] : null)
    }

    async store(userId: string, title: string, content: string, session?: ClientSession) {
        return this.postModel.create([{
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

    async delete(postId: string, session?: ClientSession): Promise<PostDocument | null> {
        return this.postModel.findOneAndDelete({ _id: postId }, session ? { session } : {})
    }

    async incScore(postId: string, score: number, session?: ClientSession) {
        return this.postModel.updateOne({ _id: postId }, { $set: { score: { $inc: score } } }, session ? { session } : {})
    }

    async incReplyCount(postId: string, value: number, session?: ClientSession) {
        return this.postModel.updateOne({ _id: postId }, { $set: { reply_count: { $inc: value } } }, session ? { session } : {})
    }

    async setPostScore(postId: string, userId: string, score: number, session?: ClientSession) {
        return this.postScoreModel.updateOne({ post: postId, user: userId }, { score: score }, { upsert: true, session: session ? session : null })
    }

    async deletePostScore(postId: string, userId: string, session?: ClientSession) {
        return this.postScoreModel.findOneAndDelete({ post: postId, user: userId }, session ? { session } : {})
    }
}