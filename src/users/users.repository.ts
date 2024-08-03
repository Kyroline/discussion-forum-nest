import { Injectable } from "@nestjs/common";
import { Model, Types } from "mongoose";
import { User, UserDocument } from "./schemas/user.schema";
import { InjectModel } from "@nestjs/mongoose";

@Injectable()
export class UsersRepository {
    constructor(
        @InjectModel(User.name) private readonly userModel: Model<User>
    ) { }

    async findAll(): Promise<UserDocument[]> {
        return this.userModel.find({}).exec()
    }

    async find(filters: { id?: Types.ObjectId, email?: string, username?: string }): Promise<UserDocument> {
        const { id, ...otherFilters } = filters

        const newFilters = id ? { _id: id, ...otherFilters } : { ...otherFilters }

        return this.userModel.findOne(newFilters).exec()
    }

    async store(username: string, email: string, password: string): Promise<UserDocument> {
        return this.userModel.create({ username: username, email: email, password: password })
    }
}