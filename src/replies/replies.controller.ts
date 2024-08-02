import { Controller, Get, Post, Body, Patch, Param, Delete, Request, UseGuards } from '@nestjs/common';
import { RepliesService } from './replies.service';
import { CreateReplyDto } from './dto/create-reply.dto';
import { UpdateReplyDto } from './dto/update-reply.dto';
import { AuthGuard } from 'src/auth/auth.guard';

@Controller('replies')
export class RepliesController {
    constructor(private readonly repliesService: RepliesService) { }

    @UseGuards(AuthGuard)
    @Post()
    create(@Request() req, @Body() createReplyDto: CreateReplyDto) {
        return this.repliesService.create(createReplyDto.post_id, req.user.sub, createReplyDto.content, createReplyDto.parent);
    }

    @UseGuards(AuthGuard)
    @Get()
    findAll(@Request() req) {
        return this.repliesService.findAll(req.user.sub);
    }

    @UseGuards(AuthGuard)
    @Get(':id')
    findOne(@Request() req, @Param('id') id: string) {
        return this.repliesService.findOne(id, req.user.sub);
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
}
