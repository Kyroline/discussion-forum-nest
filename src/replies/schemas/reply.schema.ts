import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { HydratedDocument, Types } from 'mongoose'

export type ReplyDocument = HydratedDocument<Reply>

// class Attachment {
//   @Prop()
//   name: string;

//   @Prop()
//   file: string;

//   @Prop()
//   type: string;
// }

@Schema({ timestamps: true })
export class Reply {
    @Prop({ type: Types.ObjectId, ref: 'Post', required: true })
    post: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'Reply' })
    parent: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    user: Types.ObjectId;

    @Prop({ required: true })
    content: string

    @Prop({ default: 0 })
    reply_count: number

    user_score?: number

    @Prop({ default: 0 })
    score: number

    @Prop({ default: null })
    deleted_at: Date | null
}

export const ReplySchema = SchemaFactory.createForClass(Reply);