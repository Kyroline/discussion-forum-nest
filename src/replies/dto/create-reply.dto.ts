import { IsNotEmpty, IsOptional } from "class-validator";

export class CreateReplyDto {
    @IsNotEmpty()
    post_id: string

    @IsNotEmpty()
    content: string

    @IsOptional()
    parent: string
}
