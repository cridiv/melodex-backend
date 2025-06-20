// src/track/track.service.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { extname } from 'path';
import { AcrService } from '../acr/acr/acr.service';
import { Request } from 'express';
import { AuthenticatedRequest } from '../common/types/authenticated-request';


@Injectable()
export class TrackService {
  constructor(
    private prisma: PrismaService,
    private acrService: AcrService,
  ) {}

async handleUpload(req: AuthenticatedRequest, file: Express.Multer.File) {
    const user = req.user;
    if (!user) throw new UnauthorizedException('User not found');

    console.log('Supabase User from req.user:', user);

    // Step 1: Get or create local user via supabaseId
    let localUser = await this.prisma.user.findUnique({
      where: { supabaseId: user.sub },
    });

    if (!localUser) {
      localUser = await this.prisma.user.create({
        data: {
          supabaseId: user.sub,
          email: user.email,
        },
      });
    }

    // Step 2: Save uploaded file (already in uploads/)
    const filePath = `uploads/${file.filename}`;
    const fileUrl = `http://localhost:3000/${filePath}`;

    // Step 3: Analyze with ACRCloud
    let title = file.originalname.replace(extname(file.originalname), '');
    let artist = 'Unknown';
    let releaseDate: Date | null = null;

    try {
      const acrResult = await this.acrService.recognize(file.buffer);
      const music = acrResult?.metadata?.music?.[0];

      if (music) {
        title = music.title || title;
        artist = music.artists?.[0]?.name || artist;
        releaseDate = music.release_date ? new Date(music.release_date) : null;
      }
    } catch (err) {
      console.error('ACRCloud recognition failed:', err.message || err);
    }

    // Step 4: Save to DB
    const track = await this.prisma.track.create({
      data: {
        userId: localUser.id,
        title,
        artist,
        fileUrl,
        releaseDate,
      },
    });

    return { track };
  }

  async getTracksByUser(userId: string) {
    return this.prisma.track.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }
}
