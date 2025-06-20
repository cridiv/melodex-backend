import {
  Controller,
  Post,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Req,
  Get,
  Param,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { SupabaseAuthGuard } from '../auth/supabase-auth.guard';
import { TrackService } from './track.service';
import { Request as ExpressRequest } from 'express';
import { AuthenticatedRequest } from '../common/types/authenticated-request';


@Controller('tracks')
export class TrackController {
  constructor(private readonly trackService: TrackService) {}

  // Upload endpoint
  @Post('upload')
  @UseGuards(SupabaseAuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  async uploadTrack(
    @UploadedFile() file: Express.Multer.File,
    @Req() req: ExpressRequest, // ✅ Correct usage
  ) {
    return this.trackService.handleUpload(req as AuthenticatedRequest, file);
 // ✅ req['user'] will be used
  }

  // Get all tracks for a given user
  @Get('user/:userId')
  async getTracksForUser(@Param('userId') userId: string) {
    return this.trackService.getTracksByUser(userId);
  }
}
