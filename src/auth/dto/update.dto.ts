import { IsEmail, IsNotEmpty, IsStrongPassword } from 'class-validator'
export class UpdateDto {
    @IsEmail()
    email: string

    @IsNotEmpty()
    username: string

    @IsNotEmpty()
    password: string

    @IsNotEmpty()
    newPassword: string
}
