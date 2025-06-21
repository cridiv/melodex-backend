// src/media/media.service.ts
import { Injectable } from '@nestjs/common';
import * as path from 'path';
import * as fs from 'fs';
import * as ffmpeg from 'fluent-ffmpeg';

@Injectable()
export class MediaService {
  async extractAudioFromVideo(videoPath: string): Promise<string> {
    const outputDir = path.join(__dirname, '..', '..', 'tmp');
    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir);

    const filename = path.basename(videoPath, path.extname(videoPath));
    const outputAudioPath = path.join(outputDir, `${filename}-${Date.now()}.mp3`);

    return new Promise((resolve, reject) => {
      ffmpeg(videoPath)
        .noVideo()
        .audioCodec('libmp3lame')
        .save(outputAudioPath)
        .on('end', () => {
          console.log('✅ Audio extracted:', outputAudioPath);
          resolve(outputAudioPath);
        })
        .on('error', (err) => {
          console.error('❌ FFmpeg extraction error:', err);
          reject(err);
        });
    });
  }
}
