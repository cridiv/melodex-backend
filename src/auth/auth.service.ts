import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { supabase } from '../supabase/supabase.client';

@Injectable()
export class AuthService {
  async signUp(
    email: string,
    password: string,
    fullName?: string,
    userName?: string,
    gender?: string,
    country?: string
  ) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          fullName,
          userName,
          gender,
          country,
        },
      },
    });

    if (error) {
      throw new BadRequestException(error.message); // 400 error, not 500
    }

    return data;
  }

  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw new UnauthorizedException(error.message); // 401 instead of 500
    }

    return data;
  }
}
