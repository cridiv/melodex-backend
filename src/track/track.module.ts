import { Module } from '@nestjs/common';
import { TrackController } from './track.controller';
import { TrackService } from './track.service';
import { AcrModule } from 'src/acr/acr/acr.module';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [AcrModule, PrismaModule],
  controllers: [TrackController],
  providers: [TrackService]
})
export class TrackModule {}
