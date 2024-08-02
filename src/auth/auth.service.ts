import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common'
import { UsersService } from 'src/users/users.service'
import { compare } from 'bcrypt'
import { JwtService } from '@nestjs/jwt'

@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private jwtService: JwtService
    ) { }

    async login(email: string, password: string): Promise<any> {
        const user = await this.usersService.find(email)
        if (!user)
            throw new NotFoundException()

        const valid = await compare(password, user.password)
        if (!valid)
            throw new UnauthorizedException()

        const payload = { sub: user._id, username: user.username, email: user.email }
        return { access_token: await this.jwtService.signAsync(payload) }
    }

    async register(username: string, email: string, password: string) {
        const user = await this.usersService.create(username, email, password)

        const payload = { sub: user._id, username: user.username, email: user.email }
        return { access_token: this.jwtService.signAsync(payload) }
    }
}
