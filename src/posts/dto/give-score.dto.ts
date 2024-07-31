import { IsIn } from "class-validator";

export class GiveScoreDto {
    @IsIn([1, -1])
    score: number
}