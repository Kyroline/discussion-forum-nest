import { Injectable } from "@nestjs/common";
import { InjectModel } from '@nestjs/mongoose';
import { ClientSession, Model, Types } from 'mongoose';
import { Post, PostDocument } from '../schemas/post.schema';
import { PostScore } from "../schemas/post-score.schema";
import { checkIfUserGiveScore, populateUser } from "../posts.aggregation";

@Injectable()
export class PostScoresRepository {
    constructor(
        @InjectModel(PostScore.name) private readonly postScoreModel: Model<PostScore>
    ) { }

    async addOrUpdate(postId: string, userId: string, score: number, session?: ClientSession) {
        return this.postScoreModel.findOneAndUpdate({ post: new Types.ObjectId(postId), user: new Types.ObjectId(userId) }, { score: score }, { upsert: true, session: session ? session : undefined })
    }

    async delete(postId: string, userId: string, session?: ClientSession): Promise<PostDocument | null> {
        return this.postScoreModel.findOneAndDelete({ post: new Types.ObjectId(postId), user: new Types.ObjectId(userId) }, { returnOriginal: true, session: session })
    }

    async deleteAll(postId: string, session?: ClientSession): Promise<PostDocument | null> {
        return this.postScoreModel.findOneAndDelete({ post: new Types.ObjectId(postId) }, { returnOriginal: true, session: session })
    }
}