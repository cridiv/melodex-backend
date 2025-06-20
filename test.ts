// test.ts
import { supabase } from './src/supabase/supabase.client';

async function login(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    console.error('Login failed:', error.message);
    return;
  }

  const token = data.session?.access_token;
  console.log('JWT Token:', token);
}

// ACTUALLY CALL THE FUNCTION
login('arilynck@gmail.com', 'nebula123$');
