
import { Request } from 'express';

export type SupabaseUser = {
  id: string;
  email?: string;
  sub: string;
};

export interface AuthenticatedRequest extends Request {
  user: SupabaseUser;
}
