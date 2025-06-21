import {
  Controller,
  Post,
  UseGuards,
  UploadedFile,
  UseInterceptors,
  Req,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { MediaService } from './media.service';
import { memoryStorage } from 'multer';
import { SupabaseAuthGuard } from '../auth/supabase-auth.guard';
import { AuthenticatedRequest } from '../common/types/authenticated-request';
import * as fs from 'fs';
import * as path from 'path';
import { TrackService } from '../track/track.service';
import { unlink } from 'fs/promises';

@Controller('media')
export class MediaController {
  constructor(
    private mediaService: MediaService,
    private trackService: TrackService,
  ) {}

  @Post('extract-audio')
  @UseGuards(SupabaseAuthGuard)
  @UseInterceptors(
    FileInterceptor('video', {
      storage: memoryStorage(),
      limits: { fileSize: 10 * 1024 * 1024 }, 
    }),
  )
async extractAudioFromVideo(
  @UploadedFile() file: Express.Multer.File,
  @Req() req: AuthenticatedRequest,
) {
  const filename = file.originalname.replace(/\s+/g, '_');
  const videoPath = `./tmp/${filename}`;
  fs.writeFileSync(videoPath, file.buffer);

  const audioPath = await this.mediaService.extractAudioFromVideo(videoPath);

  await unlink(videoPath).catch(console.error);

  const audioBuffer = fs.readFileSync(audioPath);
  const fakeAudioFile: Express.Multer.File = {
    ...file,
    buffer: audioBuffer,
    originalname: path.basename(audioPath),
    mimetype: 'audio/mpeg',
  };

  // Optionally delete audio after it's used
  await unlink(audioPath).catch(console.error);

  return this.trackService.handleUpload(req, fakeAudioFile);
}
}
