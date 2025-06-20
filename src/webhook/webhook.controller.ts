import { Controller, Post, Body, Headers, HttpCode } from '@nestjs/common';
import { UserService } from '../user/user.service';

@Controller('webhook')
export class WebhookController {
  constructor(private readonly userService: UserService) {}

  @Post('supabase-auth')
  @HttpCode(200) // Return 200 to avoid retries
  async handleSupabaseAuthEvent(
    @Headers('supabase-signature') signature: string,
    @Body() body: any,
  ) {
    const eventType = body.event; // Eg: 'USER_SIGNUP'
    const user = body.user;

    if (eventType === 'USER_SIGNUP') {
      // Save to DB if not already present
      await this.userService.createIfNotExists({
        id: user.id,
        email: user.email,
      });
    }

    return { received: true };
  }
}
