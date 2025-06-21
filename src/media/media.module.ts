import { Module } from '@nestjs/common';
import { MediaService } from './media.service';
import { MediaController } from './media.controller';
import { TrackService } from '../track/track.service';
import { AcrService } from '../acr/acr/acr.service';

@Module({
  controllers: [MediaController],
  providers: [MediaService, TrackService, AcrService],
})
export class MediaModule {}
