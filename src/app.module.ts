import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { WebhookController } from './webhook/webhook.controller';
import { TrackModule } from './track/track.module';
import { TrackController } from './track/track.controller';
import { TrackService } from './track/track.service';
import { AcrModule } from './acr/acr/acr.module';
import { SessionModule } from './session/session.module';
import { MediaModule } from './media/media.module';
import { VideoModule } from './video/video.module';
import { VideoService } from './video/video.service';
import { VideoController } from './video/video.controller';
import { LyricsModule } from './lyrics/lyrics-generate.module';
@Module({
  imports: [LyricsModule, VideoModule, MediaModule, SessionModule, UserModule, AuthModule, TrackModule, AcrModule],
  controllers: [AppController, WebhookController, TrackController, VideoController],
  providers: [AppService, TrackService, VideoService],
})
export class AppModule {}
