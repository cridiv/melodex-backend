// lyrics.controller.ts
import { Controller, Post, Body, UseGuards, HttpException, HttpStatus } from '@nestjs/common';
import { LyricsService } from './lyrics-generate.service';
import { SupabaseAuthGuard } from '../auth/supabase-auth.guard';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@Controller('lyrics')
@ApiTags('Lyrics')
@UseGuards(SupabaseAuthGuard)
@ApiBearerAuth()
export class LyricsController {
  constructor(private readonly lyricsService: LyricsService) {}

  @Post()
  @ApiOperation({ summary: 'Generate lyrics for a song' })
  @ApiResponse({ status: 200, description: 'Lyrics found successfully' })
  @ApiResponse({ status: 400, description: 'Invalid request data' })
  @ApiResponse({ status: 404, description: 'Lyrics not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async getLyrics(@Body() body: { title: string; artist?: string }) {
    try {
      // Validate input
      if (!body.title || body.title.trim().length === 0) {
        throw new HttpException('Title is required', HttpStatus.BAD_REQUEST);
      }

      const title = body.title.trim();
const artist = body.artist?.trim() || '';

console.log(`Lyrics request: ${artist ? `${artist} - ` : ''}${title}`);

const lyrics = await this.lyricsService.fetchLyrics(title, artist);
   
      return { 
        lyrics,
        title,
        artist,
        success: true 
      };
    } catch (error) {
      console.error('Controller error:', error.message);
      
      // Return a structured error response
      if (error instanceof HttpException) {
        throw error;
      }
      
      // For other errors, return a generic message
      throw new HttpException(
        {
          message: 'Failed to fetch lyrics',
          error: error.message,
          success: false
        },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}