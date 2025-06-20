// src/user/user.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async createIfNotExists({ id, email }: { id: string; email: string }) {
    const existingUser = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      await this.prisma.user.create({
        data: {
          id,
          email,
          supabaseId: id,
        },
      });
    }
  }
}
