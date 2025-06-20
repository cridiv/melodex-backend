import { Injectable } from '@nestjs/common';
import axios from 'axios';
import * as crypto from 'crypto';
import * as FormData from 'form-data';

@Injectable()
export class AcrService {
    private readonly host = process.env.ACR_HOST!;
    private readonly accessKey = process.env.ACR_ACCESS_KEY!;
    private readonly accessSecret = process.env.ACR_ACCESS_SECRET!;

    async recognize(audioBuffer: Buffer): Promise<any> {
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
    formData.append('sample_bytes', audioBuffer.length.toString());
    formData.append('timestamp', timestamp);
    formData.append('sample', audioBuffer, { filename: 'audio.wav' });

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
