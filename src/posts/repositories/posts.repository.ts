import { Injectable } from "@nestjs/common";
import { InjectModel } from '@nestjs/mongoose';
import { ClientSession, Model, Types } from 'mongoose';
import { Post, PostDocument } from '../schemas/post.schema';
import { PostScore } from "../schemas/post-score.schema";
import { checkIfUserGiveScore, populateUser } from "../posts.aggregation";

@Injectable()
export class PostsRepository {
    constructor(
        @InjectModel(Post.name) private readonly postModel: Model<Post>
    ) { }

    async findAll(userId?: string): Promise<PostDocument[]> {
        return this.postModel.aggregate([
            ...populateUser(),
            ...(userId ? checkIfUserGiveScore(userId) : [])
        ]).exec()
    }

    async find(postId: string, userId?: string): Promise<PostDocument | null> {
        return this.postModel.aggregate([
            { $match: { _id: new Types.ObjectId(postId) } },
            ...populateUser(),
            ...(userId ? checkIfUserGiveScore(userId) : [])
        ]).exec().then(res => res ? res[0] : null)
    }

    async store(userId: string, title: string, content: string, session?: ClientSession) {
        return this.postModel.create([{
            user: new Types.ObjectId(userId),
            title: title,
            content: content,
            score: 0,
            reply_count: 0
        }], session ? { session } : {}).then(res => res[0])
    }

    async update(postId: string, title: string, content: string, session?: ClientSession) {
        return this.postModel.updateOne({ _id: new Types.ObjectId(postId) }, { title: title, content: content }, session ? { session } : {})
    }

    async delete(postId: string, session?: ClientSession): Promise<PostDocument> {
        return this.postModel.findOneAndDelete({ _id: new Types.ObjectId(postId) }, { returnOriginal: true, session: session ?? null })
    }

    async incScore(postId: string, value: number, session?: ClientSession) {
        return this.postModel.updateOne({ _id: new Types.ObjectId(postId) }, { $inc: { score: value } }, session ? { session } : {})
    }

    async incReplyCount(postId: string, value: number, session?: ClientSession) {
        return this.postModel.updateOne({ _id: new Types.ObjectId(postId) }, { $inc: { reply_count: value } }, session ? { session } : {})
    }
}