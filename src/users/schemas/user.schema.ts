import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { HydratedDocument, Types } from 'mongoose'

export type UserDocument = HydratedDocument<User>

@Schema({ timestamps: true })
export class User {
    @Prop({ required: true })
    username: string

    @Prop({ required: true })
    email: string

    @Prop({ required: true })
    password: string
}

export const UserSchema = SchemaFactory.createForClass(User);

// const schema = new Schema(
//     {
//         username: { type: String, required: true, unique: true },
//         email: { type: String, required: true, unique: true },
//         bio: { type: String, default: null },
//         password: { type: String, required: true, select: false },
//         activated: { type: Boolean, default: false },
//         profile_picture: { type: String, default: null },
//         banner_picture: { type: String, default: null },
//         follower_count: { type: Number, default: 0 },
//         post_count: { type: Number, default: 0 }
//     },
//     {
//         timestamps: {
//             createdAt: 'created_at',
//             updatedAt: 'updated_at'
//         }
//     }
// )

// const User = mongoose.model('User', schema)

// export default User