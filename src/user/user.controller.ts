// src/user/user.controller.ts
import { Controller, Get, UseGuards, Req } from '@nestjs/common';
import { SupabaseAuthGuard } from '../auth/supabase-auth.guard';

@Controller('user')
export class UserController {
  @Get('me')
  @UseGuards(SupabaseAuthGuard)
  getMe(@Req() req) {
    return req.user;
  }
}
