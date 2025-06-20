import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module'
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { WebhookController } from './webhook/webhook.controller';
import { TrackModule } from './track/track.module';
import { TrackController } from './track/track.controller';
import { TrackService } from './track/track.service';
import { AcrModule } from './acr/acr/acr.module';

@Module({
  imports: [PrismaModule, UserModule, AuthModule, TrackModule, AcrModule],
  controllers: [AppController, WebhookController, TrackController],
  providers: [AppService, TrackService],
})
export class AppModule {}
