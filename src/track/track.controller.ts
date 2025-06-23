// src/track/track.controller.ts
import {
  Controller,
  Patch,
  Param,
  Post,
  Body,
  Delete,
  UseGuards,
  Logger,
  NotFoundException,
  UploadedFile,
  UseInterceptors,
  Req,
} from '@nestjs/common';
import { SupabaseAuthGuard } from '../auth/supabase-auth.guard';
import { TrackService } from './track.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { Request } from 'express';

@Controller('tracks')
@UseGuards(SupabaseAuthGuard)
export class TrackController {
  private readonly logger = new Logger(TrackController.name);

  constructor(private readonly trackService: TrackService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadTrack(
    @Req() req: Request,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.trackService.handleUpload(req as any, file);
  }

    @Post('upload-link')
  async uploadFromLink(@Req() req: Request, @Body() body: { link: string }) {
    const user = req.user;
    if (!user) throw new Error('User not found');
    return this.trackService.handleLinkUpload(req as any, body.link, user.id);
  }

  @Patch(':id')
  async updateTrack(
    @Param('id') id: string,
    @Body() body: { lyrics?: string },
  ) {
    const result = await this.trackService.updateTrack?.(id, body);
    if (!result) throw new NotFoundException('Track not found');
    return result;
  }

  @Delete(':id')
  async deleteTrack(@Param('id') id: string) {
    return this.trackService.deleteTrack(id);
  }

  @Patch(':id/generate-lyrics')
  async generateLyrics(@Param('id') id: string) {
    return this.trackService.generateLyrics(id);
  }

}
