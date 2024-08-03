import { Injectable } from '@nestjs/common';
import { UsersRepository } from './users.repository';
import { UserDocument } from './schemas/user.schema';
import { hash } from 'bcrypt'
import { IUsersService } from './interfaces/users-service.interface';
import { Types } from 'mongoose';

@Injectable()
export class UsersService implements IUsersService {
    constructor(
        private usersRepository: UsersRepository
    ) { }

    async findAll(): Promise<UserDocument[]> {
        return null
    }

    async find(filters: { id?: Types.ObjectId, email?: string, username?: string }): Promise<UserDocument> {
        return this.usersRepository.find(filters)
    }

    async create(username: string, email: string, password: string): Promise<UserDocument> {
        return this.usersRepository.store(username, email, await hash(password, 10))
    }
}
