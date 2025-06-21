import { Injectable } from '@nestjs/common';
import { exec } from 'child_process';
import { promisify } from 'util';
import { randomUUID } from 'crypto';
import * as path from 'path';
import * as fs from 'fs';

const execPromise = promisify(exec);

@Injectable()
export class VideoService {
  async extractAudioFromLink(url: string): Promise<{ filePath: string }> {
    const id = randomUUID();
    const outputDir = path.resolve(__dirname, '../../media');
    const outputFile = path.join(outputDir, `${id}.mp3`);

    // Ensure media directory exists
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const command = `yt-dlp -x --audio-format mp3 -o "${outputFile}" "${url}"`;

    try {
      await execPromise(command);
      return { filePath: outputFile };
    } catch (err) {
      console.error('❌ yt-dlp error:', err);
      throw new Error('Failed to extract audio');
    }
  }
}
