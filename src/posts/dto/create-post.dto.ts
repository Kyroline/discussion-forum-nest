import { IsNotEmpty, IsOptional } from 'class-validator'
export class CreatePostDto {
    @IsNotEmpty()
    title: string
    
    @IsNotEmpty()
    content: string
}
