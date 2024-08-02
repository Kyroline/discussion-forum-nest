import { Injectable } from "@nestjs/common";
import { Model } from "mongoose";
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

    async find(email: string): Promise<UserDocument | null> {
        return this.userModel.findOne({ email: email }).exec()
    }

    async store(username: string, email: string, password: string) {
        return this.userModel.create({ username: username, email: email, password: password })
    }
}