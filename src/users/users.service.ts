import { Injectable } from '@nestjs/common';
import { UsersRepository } from './users.repository';
import { UserDocument } from './schemas/user.schema';
import { hash } from 'bcrypt'

@Injectable()
export class UsersService {
    constructor(private usersRepository: UsersRepository) { }

    async findAll() {

    }

    async find(username: string): Promise<UserDocument | null> {
        return this.usersRepository.find(username)
    }

    async create(username: string, email: string, password: string): Promise<UserDocument | null> {
        return this.usersRepository.store(username, email, await hash(password, 10))
    }
}
