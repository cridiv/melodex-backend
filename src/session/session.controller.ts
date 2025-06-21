import { Controller, Get, Post, Body, Param, Delete, UseGuards } from '@nestjs/common';
import { SessionService } from './session.service';
import { SupabaseAuthGuard } from '../auth/supabase-auth.guard';

@Controller('sessions')
export class SessionController {
  constructor(private readonly sessionService: SessionService) {}

  @Get(':sessionId/tracks')
  @UseGuards(SupabaseAuthGuard)
  async getTracksForSession(@Param('sessionId') sessionId: string) {
    return this.sessionService.getTracksBySession(sessionId);
  }
  @Get('user/:userId')
  async getUserSessions(@Param('userId') userId: string) {
    return this.sessionService.getSessionsByUser(userId);
  }

  @Post()
  async createSession(@Body() body: { name: string; userId: string }) {
    return this.sessionService.createSession(body.name, body.userId);
  }

  @Delete(':id')
async deleteSession(@Param('id') id: string) {
  console.log('Delete request received for:', id);
  return this.sessionService.deleteSession(id);
}

}
