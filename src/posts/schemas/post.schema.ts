import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { HydratedDocument, Types } from 'mongoose'

export type PostDocument = HydratedDocument<Post>

// class Attachment {
//   @Prop()
//   name: string;

//   @Prop()
//   file: string;

//   @Prop()
//   type: string;
// }

@Schema({ timestamps: true })
export class Post {

    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    user: Types.ObjectId;

    @Prop({ required: true })
    title: string

    @Prop({ required: true })
    content: string

    @Prop({ default: 0 })
    reply_count: number

    user_score?: number
    saved?: boolean

    @Prop({ default: 0 })
    score: number

    @Prop({ default: null })
    deleted_at: Date | null
}

export const PostSchema = SchemaFactory.createForClass(Post);