import { Types } from "mongoose"
import { UserDocument } from "../schemas/user.schema"

export interface IUsersService {
    findAll(): Promise<UserDocument[]>

    find(filters: { id?: Types.ObjectId, email?: string, username?: string }): Promise<UserDocument>

    create(username: string, email: string, password: string): Promise<UserDocument>
}