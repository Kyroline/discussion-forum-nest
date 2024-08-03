import { Injectable } from "@nestjs/common";
import { InjectModel } from '@nestjs/mongoose';
import { ClientSession, Model, PipelineStage, Types } from 'mongoose';
import { checkIfUserGiveScore, populateUser } from "../replies.aggregation";
import { Reply, ReplyDocument } from "../schemas/reply.schema";
import { ReplyScore } from "../schemas/reply-score.schema";

@Injectable()
export class RepliesRepository {
    constructor(
        @InjectModel(Reply.name) private readonly replyModel: Model<Reply>,
    ) { }

    async findAll(userId?: string, pipeline?: PipelineStage[]): Promise<ReplyDocument[]> {
        return this.replyModel.aggregate([
            ...pipeline,
            ...populateUser(),
            ...(userId ? checkIfUserGiveScore(userId) : [])
        ]).exec()
    }

    async find(replyId: string, userId?: string): Promise<ReplyDocument | null> {
        return this.replyModel.aggregate([
            { $match: { _id: new Types.ObjectId(replyId) } },
            ...populateUser(),
            ...(userId ? checkIfUserGiveScore(userId) : [])
        ]).exec().then(res => res ? res[0] : null)
    }

    async store(postId: string, userId: string, content: string, parent?: string, session?: ClientSession) {
        return this.replyModel.create([{
            parent: parent ? new Types.ObjectId(parent) : null,
            post: new Types.ObjectId(postId),
            user: new Types.ObjectId(userId),
            content: content,
            score: 0,
            reply_count: 0
        }], session ? { session } : {}).then(res => res[0])
    }

    async update(replyId: string, content: string, session?: ClientSession) {
        return this.replyModel.updateOne({ _id: new Types.ObjectId(replyId) }, { content: content }, session ? { session } : {})
    }

    async delete(replyId: string, session?: ClientSession): Promise<ReplyDocument> {
        return this.replyModel.findOneAndDelete({ _id: new Types.ObjectId(replyId) }, { returnOriginal: true, session: session ?? null })
    }

    async incScore(replyId: string, score: number, session?: ClientSession) {
        return this.replyModel.updateOne({ _id: new Types.ObjectId(replyId) }, { $inc: { score: score } }, session ? { session } : {})
    }

    async incReplyCount(replyId: string, value: number, session?: ClientSession) {
        return this.replyModel.updateOne({ _id: new Types.ObjectId(replyId) }, { $inc: { reply_count: value } }, session ? { session } : {})
    }
}