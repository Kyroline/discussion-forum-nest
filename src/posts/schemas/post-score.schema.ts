import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { HydratedDocument, Types } from 'mongoose'

export type PostScoreDocument = HydratedDocument<PostScore>

@Schema({ timestamps: true })
export class PostScore {
    @Prop({ type: Types.ObjectId, ref: 'Post', required: true })
    post: Types.ObjectId

    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    user: Types.ObjectId

    @Prop({ required: true })
    score: number

}

export const PostScoreSchema = SchemaFactory.createForClass(PostScore);