import {
  Controller,
  Post,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Req,
  Get,
  Param,
  Body,
  Delete,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { SupabaseAuthGuard } from '../auth/supabase-auth.guard';
import { TrackService } from './track.service';
import { Request as ExpressRequest } from 'express';
import { AuthenticatedRequest } from '../common/types/authenticated-request';
import { memoryStorage } from 'multer';
import { Query, Res, Header } from '@nestjs/common';
import { Response } from 'express';
import * as fs from 'fs';


@Controller('tracks')
export class TrackController {
  constructor(private readonly trackService: TrackService) {}

  @Post('upload')
  @UseGuards(SupabaseAuthGuard)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB
      },
    }),
  )
  async uploadTrack(
    @UploadedFile() file: Express.Multer.File,
    @Req() req: ExpressRequest,
  ) {
    return this.trackService.handleUpload(req as AuthenticatedRequest, file);
  }

  @Delete(':id')
@UseGuards(SupabaseAuthGuard)
async deleteTrack(@Param('id') id: string) {
  return this.trackService.deleteTrack(id);
}

  @Get('user/:userId')
  async getTracksForUser(@Param('userId') userId: string) {
    return this.trackService.getTracksByUser(userId);
  }

  @Post('save-to-session')
  @UseGuards(SupabaseAuthGuard)
  async saveToSession(
    @Body() body: {
      sessionId: string;
      userId: string;
      title: string;
      artist: string;
      album?: string;
      duration?: number;
      genre?: string;
      image?: string;
      fileUrl: string;
      fileType: string;
    },
  ) {
    return this.trackService.saveToSession({
      ...body,
      duration: body.duration !== undefined ? String(body.duration) : undefined,
    });
  }

  @Post('upload-link')
  @UseGuards(SupabaseAuthGuard)
  async uploadFromLink(
    @Req() req: ExpressRequest,
    @Body() body: { link: string; userId: string },
  ) {
    const { link, userId } = body;
    return this.trackService.handleLinkUpload(req as AuthenticatedRequest, link, userId);
  }

  @Get('download-audio')
  @UseGuards(SupabaseAuthGuard)
  async downloadAudio(@Query('id') id: string, @Res() res: Response) {
    const fileStream = await this.trackService.getAudioFileStream(id);
    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Content-Disposition', `attachment; filename="${id}.mp3"`);
    fileStream.pipe(res);
  }

  // ✅ Secure video download
  @Get('download-video')
  @UseGuards(SupabaseAuthGuard)
  async downloadVideo(@Query('id') id: string, @Res() res: Response) {
    const fileStream = await this.trackService.getVideoFileStream(id);
    res.setHeader('Content-Type', 'video/mp4');
    res.setHeader('Content-Disposition', `attachment; filename="${id}.mp4"`);
    fileStream.pipe(res);
  }
}
