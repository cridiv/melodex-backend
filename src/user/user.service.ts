// src/user/user.service.ts
import { Injectable } from '@nestjs/common';
import { supabase } from '../supabase/supabase.client';

@Injectable()
export class UserService {
  async createIfNotExists({ id, email }: { id: string; email: string }) {
    const { data, error } = await supabase
      .from('supabase_users')
      .select('*')
      .eq('supabase_id', id)
      .maybeSingle();

    if (error) throw error;

    if (!data) {
      const { error: insertError } = await supabase
        .from('supabase_users')
        .insert([{ supabase_id: id, email }]);

      if (insertError) throw insertError;
    }
  }
}
