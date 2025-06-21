import { Module } from '@nestjs/common';
import { LyricsService } from './lyrics-generate.service';
import { LyricsController } from './lyrics-generate.controller';

@Module({
  providers: [LyricsService],
  controllers: [LyricsController],
})
export class LyricsModule {}
