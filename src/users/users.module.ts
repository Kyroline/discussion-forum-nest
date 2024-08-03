import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './schemas/user.schema';
import { UsersRepository } from './users.repository';

@Module({
    imports: [MongooseModule.forFeature([{ name: User.name, schema: UserSchema }])],
    providers: [
        {
            provide: 'IUsersService',
            useClass: UsersService
        },
        UsersRepository
    ],
    exports: ['IUsersService']
})
export class UsersModule { }
