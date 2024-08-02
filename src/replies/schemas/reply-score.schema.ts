import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { HydratedDocument, Types } from 'mongoose'

export type ReplyScoreDocument = HydratedDocument<ReplyScore>

@Schema({ timestamps: true })
export class ReplyScore {
    @Prop({ type: Types.ObjectId, ref: 'Reply', required: true })
    post: Types.ObjectId

    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    user: Types.ObjectId

    @Prop({ required: true })
    score: number

}

export const ReplyScoreSchema = SchemaFactory.createForClass(ReplyScore);