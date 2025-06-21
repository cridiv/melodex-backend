import { Module } from '@nestjs/common';
import { TrackController } from './track.controller';
import { TrackService } from './track.service';
import { AcrModule } from 'src/acr/acr/acr.module';

@Module({
  imports: [AcrModule],
  controllers: [TrackController],
  providers: [TrackService]
})
export class TrackModule {}
