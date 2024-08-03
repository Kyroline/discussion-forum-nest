import { Controller, Get, Post, Body, Patch, Param, Delete, Request, UseGuards, Query } from '@nestjs/common';
import { RepliesService } from './replies.service';
import { CreateReplyDto } from './dto/create-reply.dto';
import { UpdateReplyDto } from './dto/update-reply.dto';
import { AuthGuard, OptionalAuthGuard } from '../auth/auth.guard';
import { GiveScoreDto } from './dto/give-score.dto';

@Controller('replies')
export class RepliesController {
    constructor(private readonly repliesService: RepliesService) { }

    @UseGuards(AuthGuard)
    @Post()
    create(@Request() req, @Body() createReplyDto: CreateReplyDto) {
        return this.repliesService.create(createReplyDto.post_id, req.user.sub, createReplyDto.content, createReplyDto.parent);
    }

    @UseGuards(OptionalAuthGuard)
    @Get()
    findAll(@Request() req, @Query() query) {
        return this.repliesService.findAll(req.user?.sub, query ? { parent: query?.parent, post: query?.post } : null);
    }

    @UseGuards(OptionalAuthGuard)
    @Get(':id')
    findOne(@Request() req, @Param('id') id: string) {
        return this.repliesService.findOne(id, req.user?.sub);
    }

    @UseGuards(AuthGuard)
    @Patch(':id')
    update(@Request() req, @Param('id') id: string, @Body() updateReplyDto: UpdateReplyDto) {
        return this.repliesService.update(id, updateReplyDto.content, req.user.sub);
    }

    @UseGuards(AuthGuard)
    @Delete(':id')
    remove(@Request() req, @Param('id') id: string) {
        return this.repliesService.remove(id, req.user.sub);
    }

    @UseGuards(AuthGuard)
    @Post(':id/score')
    giveScore(@Request() req, @Param('id') id: string, @Body() giveScoreDto: GiveScoreDto) {
        return this.repliesService.giveScore(id, req.user.sub, giveScoreDto.score)
    }

    @UseGuards(AuthGuard)
    @Delete(':id/score')
    deleteScore(@Request() req, @Param('id') id: string) {
        return this.repliesService.deleteScore(id, req.user.sub);
    }
}
