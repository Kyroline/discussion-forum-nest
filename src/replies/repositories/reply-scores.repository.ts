import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ReplyScore } from '../schemas/reply-score.schema';
import { ClientSession, Model, Types } from 'mongoose';


@Injectable()
export class ReplyScoresRepository {
    constructor(
        @InjectModel(ReplyScore.name) private readonly replyScoreModel: Model<ReplyScore>
    ) { }

    async addOrUpdate(replyId: string, userId: string, score: number, session?: ClientSession) {
        return this.replyScoreModel.findOneAndUpdate({ post: new Types.ObjectId(replyId), user: new Types.ObjectId(userId) }, { score: score }, { upsert: true, session: session ? session : null })
    }

    async delete(replyId: string, userId: string, session?: ClientSession) {
        return this.replyScoreModel.findOneAndDelete({ post: new Types.ObjectId(replyId), user: new Types.ObjectId(userId) }, session ? { session } : {})
    }

    async deleteAll(replyId: string, session?: ClientSession) {
        return this.replyScoreModel.deleteMany({ post: new Types.ObjectId(replyId) }, session ? { session } : {})
    }
}