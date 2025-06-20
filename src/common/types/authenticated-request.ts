
import { Request } from 'express';

export type SupabaseUser = {
  sub: string;
  email: string;
};

export interface AuthenticatedRequest extends Request {
  user: SupabaseUser;
}
