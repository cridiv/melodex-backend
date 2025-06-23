// src/track/track.service.ts
import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { extname } from 'path';
import { AcrService } from '../acr/acr/acr.service';
import { AuthenticatedRequest } from '../common/types/authenticated-request';
import { supabase } from '../supabase/supabase.client';
import { createReadStream, unlinkSync } from 'fs';
import { tmpdir } from 'os';
import * as path from 'path';
import * as fs from 'fs';
import { execSync } from 'child_process';
import { Readable } from 'stream';
import { Client } from 'genius-lyrics';


const geniusClient = new Client();


@Injectable()
export class TrackService {
  constructor(private acrService: AcrService) {}

  async handleUpload(req: AuthenticatedRequest, file: Express.Multer.File) {
    try {
      const user = req.user;
      if (!user) throw new UnauthorizedException('User not found');

      const userId = user.sub; // ✅ Supabase UUID
      console.log('Supabase User:', user);

      const filename = file.originalname.replace(/\s+/g, '_');
      const filePath = `uploads/${filename}`;
      const fileUrl = `http://localhost:3000/${filePath}`;

      // Analyze with ACRCloud
      const titleFromName = file.originalname.replace(extname(file.originalname), '');
      let title = titleFromName;
      let artist = 'Unknown';
      let releaseDate: Date | null = null;
      let genre: string | null = null;
      let albumArt: string | null = null;
      let duration: number | undefined = undefined;

      try {
        const acrResult = await this.acrService.recognize(file.buffer);
        const music = acrResult?.metadata?.music?.[0];

        if (music) {
          title = music.title || titleFromName;
          artist = music.artists?.[0]?.name || artist;
          releaseDate = music.release_date ? new Date(music.release_date) : null;
          genre = music.genres?.[0]?.name || null;
          duration =
           music.duration_ms !== undefined ? Math.round(music.duration_ms / 1000) : undefined;

          albumArt =
            music?.external_metadata?.spotify?.album?.images?.[0]?.url ??
            music?.album?.images?.[0]?.url ??
            null;
        }

        console.log('ACR Result:', music);
      } catch (acrErr) {
        console.error('ACRCloud failed:', acrErr.message || acrErr);
      }
      
      return {
        metadata: {
          title,
          artist,
          releaseDate,
          fileUrl,
          originalFilename: file.originalname,
          albumArt,
          genre,
          fileType: file.mimetype,
          duration,
        },
      };
    } catch (err) {
      console.error('❌ handleUpload() error:', err);
      throw err;
    }
  }

  async getTracksByUser(userId: string) {
    const { data, error } = await supabase
      .from('tracks')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  async saveToSession(data: {
    sessionId: string;
    userId: string;
    title: string;
    artist: string;
    album?: string;
    duration?: string;
    genre?: string;
    image?: string;
    fileUrl: string;
    fileType: string;
  }) {
    const {
      sessionId,
      userId,
      title,
      artist,
      album,
      duration,
      genre,
      image,
      fileUrl,
      fileType,
    } = data;

    // ✅ Ensure session belongs to user
    const { data: session, error: sessionError } = await supabase
      .from('sessions')
      .select('*')
      .eq('id', sessionId)
      .eq('user_id', userId)
      .single();

    if (sessionError || !session) {
      throw new NotFoundException('Session not found or unauthorized');
    }

    const { error: insertError, data: newTrack } = await supabase
      .from('tracks')
      .insert([
        {
          user_id: userId,
          session_id: sessionId,
          title,
          artist,
          album,
          duration,
          genre,
          image,
          file_url: fileUrl,
          file_type: fileType,
          release_date: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (insertError) throw insertError;

    return { message: 'Track saved to session', track: newTrack };
  }

  
async handleLinkUpload(req: AuthenticatedRequest, link: string, userId: string) {
  const id = `track-${Date.now()}`;
  const tmpVideoPath = path.join(tmpdir(), `${id}.mp4`);
  const tmpAudioPath = path.join(tmpdir(), `${id}.mp3`);

  try {
    // Step 1: Download video with yt-dlp
    execSync(`yt-dlp -f best -o "${tmpVideoPath}" "${link}"`);

    // Step 2: Extract audio with ffmpeg
    execSync(`ffmpeg -i "${tmpVideoPath}" -vn -acodec libmp3lame -y "${tmpAudioPath}"`);

    // Step 3: Create a fake file object (like Multer gives)
    const fileBuffer = fs.readFileSync(tmpAudioPath);
    const fakeFile: Express.Multer.File = {
      fieldname: 'file',
      originalname: 'extracted.mp3',
      encoding: '7bit',
      mimetype: 'audio/mpeg',
      buffer: fileBuffer,
      size: fileBuffer.length,
      destination: '',
      filename: '',
      path: '',
      stream: Readable.from(fileBuffer),
    };

    // Step 4: Reuse your existing upload handler
    return await this.handleUpload(req, fakeFile);
  } catch (err) {
    console.error('❌ Link upload failed:', err.message);
    throw err;
  } finally {
    // Clean up
    try {
      if (fs.existsSync(tmpVideoPath)) unlinkSync(tmpVideoPath);
      if (fs.existsSync(tmpAudioPath)) unlinkSync(tmpAudioPath);
    } catch (cleanupErr) {
      console.warn('Cleanup failed:', cleanupErr.message);
    }
  }
}
async deleteTrack(id: string) {
  const { error } = await supabase
    .from('tracks')
    .delete()
    .eq('id', id);

  if (error) throw new Error(error.message);
  return { message: 'Track deleted successfully' };
}

  async getAudioFileStream(id: string): Promise<fs.ReadStream> {
    const filePath = path.join(__dirname, '../../temp', `${id}.mp3`);
    if (!fs.existsSync(filePath)) throw new NotFoundException('Audio file not found');
    return fs.createReadStream(filePath);
  }

  // ✅ Secure method for video
  async getVideoFileStream(id: string): Promise<fs.ReadStream> {
    const filePath = path.join(__dirname, '../../temp', `${id}.mp4`);
    if (!fs.existsSync(filePath)) throw new NotFoundException('Video file not found');
    return fs.createReadStream(filePath);
  }

   async generateLyrics(id: string) {
    // Fetch the track
    const { data: track, error } = await supabase
      .from('tracks')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !track) throw new Error('Track not found');

    const searchQuery = `${track.title} ${track.artist}`;

    const searches = await geniusClient.songs.search(searchQuery);
    const firstResult = searches[0];
    if (!firstResult) throw new Error('Lyrics not found');

    const lyrics = await firstResult.lyrics();

const { error: updateError } = await supabase
  .from('tracks')
  .update({ lyrics })
  .eq('id', id);

if (updateError) {
  console.error('🔥 Supabase update error:', updateError.message);
  throw new Error('Failed to update lyrics');
}

    return { ...track, lyrics };
  }

async updateTrack(id: string, updates: Partial<{ lyrics: string }>) {
  const { data, error } = await supabase
    .from('tracks')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw new Error('Failed to update track with lyrics');

  return data;
}

}
