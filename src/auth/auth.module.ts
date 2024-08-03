import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersModule } from '../users/users.module';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';

@Module({
    imports: [
        UsersModule,
        JwtModule.register({
            global: true,
            secret: process.env.JWT_KEY || 'secret',
            signOptions: { expiresIn: '3600s' }
        })
    ],
    controllers: [AuthController],
    providers: [
        {
            provide: AuthService,
            useFactory: (
                usersService: UsersService,
                jwtService: JwtService
            ) => new AuthService(usersService, jwtService),
            inject: ['IUsersService', JwtService]
        }
    ]
})
export class AuthModule { }
