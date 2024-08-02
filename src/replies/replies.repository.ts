import { Injectable } from "@nestjs/common";
import { InjectModel } from '@nestjs/mongoose';
import { ClientSession, Model, PipelineStage, Types } from 'mongoose';
import { checkIfUserGiveScore, populateUser } from "./replies.aggregation";
import { Reply, ReplyDocument } from "./schemas/reply.schema";
import { ReplyScore } from "./schemas/reply-score.schema";

@Injectable()
export class RepliesRepository {
    constructor(
        @InjectModel(Reply.name) private readonly replyModel: Model<Reply>,
        @InjectModel(ReplyScore.name) private readonly replyScoreModel: Model<ReplyScore>
    ) { }

    async findAll(userId?: string, pipeline?: PipelineStage[]): Promise<ReplyDocument[]> {
        return this.replyModel.aggregate([
            ...pipeline,
            ...populateUser(),
            ...(userId ? checkIfUserGiveScore(userId) : [])
        ]).exec()
    }

    async find(postId: string, userId?: string): Promise<ReplyDocument | null> {
        return this.replyModel.aggregate([
            { $match: { _id: new Types.ObjectId(postId) } },
            ...populateUser(),
            ...(userId ? checkIfUserGiveScore(userId) : [])
        ]).exec().then(res => res ? res[0] : null)
    }

    async store(postId: string, userId: string, content: string, parent?: string, session?: ClientSession) {
        return this.replyModel.create([{
            parent: parent,
            post: postId,
            user: userId,
            content: content,
            score: 0,
            reply_count: 0
        }], session ? { session } : {}).then(res => res[0])
    }

    async update(postId: string, content: string, session?: ClientSession) {
        return this.replyModel.updateOne({ _id: postId }, { content: content }, session ? { session } : {})
    }

    async delete(postId: string, session?: ClientSession): Promise<ReplyDocument | null> {
        return this.replyModel.findOneAndDelete({ _id: postId }, session ? { session } : {})
    }

    async incScore(postId: string, score: number, session?: ClientSession) {
        return this.replyModel.updateOne({ _id: postId }, { $set: { score: { $inc: score } } }, session ? { session } : {})
    }

    async incReplyCount(postId: string, value: number, session?: ClientSession) {
        return this.replyModel.updateOne({ _id: postId }, { $set: { reply_count: { $inc: value } } }, session ? { session } : {})
    }

    async setPostScore(postId: string, userId: string, score: number, session?: ClientSession) {
        return this.replyScoreModel.updateOne({ post: postId, user: userId }, { score: score }, { upsert: true, session: session ? session : null })
    }

    async deletePostScore(postId: string, userId: string, session?: ClientSession) {
        return this.replyScoreModel.deleteOne({ post: postId, user: userId }, session ? { session } : {})
    }
}