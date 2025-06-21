import { Injectable } from '@nestjs/common';
import axios from 'axios';
import * as crypto from 'crypto';
import * as FormData from 'form-data';
import * as ffmpeg from 'fluent-ffmpeg';
import { Readable } from 'stream';
import { PassThrough } from 'stream';


const ffmpegInstaller = require('@ffmpeg-installer/ffmpeg');
@Injectable()
export class AcrService {
  private readonly host = process.env.ACR_HOST!;
  private readonly accessKey = process.env.ACR_ACCESS_KEY!;
  private readonly accessSecret = process.env.ACR_ACCESS_SECRET!;

  constructor() {
    ffmpeg.setFfmpegPath(ffmpegInstaller.path);
  }

  private async trimAudioBuffer(buffer: Buffer, seconds = 15): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const inputStream = new Readable();
      inputStream.push(buffer);
      inputStream.push(null); // End of stream

      const outputStream = new PassThrough();
      const chunks: Buffer[] = [];

      outputStream.on('data', (chunk) => chunks.push(chunk));
      outputStream.on('end', () => resolve(Buffer.concat(chunks)));
      outputStream.on('error', reject);

      ffmpeg(inputStream)
        .format('wav')
        .duration(seconds)
        .audioCodec('pcm_s16le')
        .on('error', reject)
        .pipe(outputStream, { end: true });
    });
  }

  async recognize(audioBuffer: Buffer): Promise<any> {
    console.log('Trimming audio buffer before sending to ACRCloud...');
    const trimmedBuffer = await this.trimAudioBuffer(audioBuffer, 15); // trim to 15s

    const httpMethod = 'POST';
    const httpUri = '/v1/identify';
    const dataType = 'audio';
    const signatureVersion = '1';
    const timestamp = Math.floor(Date.now() / 1000).toString();

    const stringToSign = [
      httpMethod,
      httpUri,
      this.accessKey,
      dataType,
      signatureVersion,
      timestamp,
    ].join('\n');

    const signature = crypto
      .createHmac('sha1', this.accessSecret)
      .update(Buffer.from(stringToSign, 'utf-8'))
      .digest('base64');

    const formData = new FormData();
    formData.append('access_key', this.accessKey);
    formData.append('data_type', dataType);
    formData.append('signature_version', signatureVersion);
    formData.append('signature', signature);
    formData.append('sample_bytes', trimmedBuffer.length.toString());
    formData.append('timestamp', timestamp);
    formData.append('sample', trimmedBuffer, { filename: 'trimmed.wav' });

    const response = await axios.post(
      `https://${this.host}/v1/identify`,
      formData,
      {
        headers: formData.getHeaders(),
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
      },
    );

    return response.data;
  }
}
