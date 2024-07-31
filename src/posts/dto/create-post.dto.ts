import { IsNotEmpty, IsOptional } from 'class-validator'
export class CreatePostDto {
    @IsOptional()
    community_id: string
    
    @IsNotEmpty()
    user_id: string

    @IsNotEmpty()
    title: string
    
    @IsNotEmpty()
    content: string
}
