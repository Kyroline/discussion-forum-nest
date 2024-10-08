import { ConflictException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common'
import { UsersService } from '../users/users.service'
import { compare } from 'bcrypt'
import { JwtService } from '@nestjs/jwt'
import { UserDocument } from '../users/schemas/user.schema'
import { Types } from 'mongoose'

@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private jwtService: JwtService
    ) { }

    async login(email: string, password: string): Promise<any> {
        const user = await this.usersService.find({ email: email })
        if (!user)
            throw new UnauthorizedException({ statusCode: 401, message: 'Invalid credentials' })

        const valid = await compare(password, user.password)
        if (!valid)
            throw new UnauthorizedException({ statusCode: 401, message: 'Invalid credentials' })

        const payload = { sub: user._id, username: user.username, email: user.email }
        return { access_token: await this.jwtService.signAsync(payload) }
    }

    async register(username: string, email: string, password: string) {
        let user: UserDocument
        try {
            user = await this.usersService.create(username, email, password)
        } catch (error) {
            if (error.code == 11000)
                throw new ConflictException({ statusCode: 409, message: 'Email or username is already in use' })
        }

        const payload = { sub: user._id, username: user.username, email: user.email }
        return { access_token: await this.jwtService.signAsync(payload) }
    }

    async update(id: string, username: string, email: string, password: string, newPassword: string) {
        let user: UserDocument
        try {
            user = await this.usersService.find({ id: new Types.ObjectId(id) })
            console.log(user)
            const valid = await compare(password, user.password)
        } catch (error) {
            throw new UnauthorizedException()
        }
        try {
            await this.usersService.update(id, username, email, newPassword)
        } catch (error) {
            if (error.code == 11000)
                throw new ConflictException({ statusCode: 409, message: 'Email or username is already in use' })
            throw new Error()
        }
        console.log('setelah update')

        const payload = { sub: user._id, username: user.username, email: user.email }
        return { access_token: await this.jwtService.signAsync(payload) }
    }
}
