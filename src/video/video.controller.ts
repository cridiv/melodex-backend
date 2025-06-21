import { Controller, Post, Body } from '@nestjs/common';
import { VideoService } from './video.service';

@Controller('extract')
export class VideoController {
  constructor(private readonly videoService: VideoService) {}

  @Post('audio-from-link')
  async extractAudio(@Body() body: { url: string }) {
    const { url } = body;
    if (!url) throw new Error('URL is required');

    return await this.videoService.extractAudioFromLink(url);
  }
}
