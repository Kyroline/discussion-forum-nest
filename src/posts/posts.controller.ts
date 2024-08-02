import { Controller, Get, Post, Body, Patch, Param, Delete, Request, UseGuards } from '@nestjs/common';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { GiveScoreDto } from './dto/give-score.dto';
import { AuthGuard } from 'src/auth/auth.guard';

@Controller('posts')
export class PostsController {
    constructor(private readonly postsService: PostsService) { }

    @UseGuards(AuthGuard)
    @Post()
    async create(@Request() req, @Body() createPostDto: CreatePostDto) {
        return this.postsService.create(req.user.sub, createPostDto);
    }

    @UseGuards(AuthGuard)
    @Get()
    findAll(@Request() req) {
        return this.postsService.findAll(req.user ? req.user.sub : null);
    }

    @UseGuards(AuthGuard)
    @Get(':id')
    findOne(@Request() req, @Param('id') id: string) {
        return this.postsService.findOne(id, req.user ? req.user.sub : null);
    }

    @UseGuards(AuthGuard)
    @Patch(':id')
    update(@Request() req, @Param('id') id: string, @Body() updatePostDto: UpdatePostDto) {
        return this.postsService.update(id, updatePostDto);
    }

    @UseGuards(AuthGuard)
    @Delete(':id')
    remove(@Request() req, @Param('id') id: string) {
        return this.postsService.remove(id);
    }

    @UseGuards(AuthGuard)
    @Post(':id/score')
    giveScore(@Request() req, @Param('id') id: string, @Body() giveScoreDto: GiveScoreDto) {
        return this.postsService.giveScore(id, req.user.sub, giveScoreDto.score)
    }

    @UseGuards(AuthGuard)
    @Delete(':id/score')
    deleteScore(@Request() req, @Param('id') id: string) {
        return this.postsService.deleteScore(id, req.user.sub)
    }
}
