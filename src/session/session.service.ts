// src/session/session.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { supabase } from '../supabase/supabase.client';
import { SaveToSessionDto } from './dto/save-to-session.dto';

@Injectable()
export class SessionService {
  async getSessionsByUser(userId: string) {
    const { data, error } = await supabase
      .from('sessions')
      .select(`
        id,
        name,
        created_at,
        tracks(count)
      `)
      .eq('user_id', userId);

    if (error) throw new Error(error.message);

    return data.map((session) => ({
      id: session.id,
      name: session.name,
      createdAt: session.created_at,
      _count: {
        tracks: session.tracks?.[0]?.count ?? 0
      },
    }));
  }

  async createSession(name: string, userId: string) {
    const { data, error } = await supabase
      .from('sessions')
      .insert([{ name, user_id: userId }])
      .select();

    if (error) throw new Error(error.message);
    return data;
  }

  async getTracksBySession(sessionId: string) {
    const { data, error } = await supabase
      .from('tracks')
      .select('id, title, artist, album, file_url, duration, genre, image, created_at')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);

    return data.map((track) => ({
      id: track.id,
      title: track.title,
      artist: track.artist,
      album: track.album,
      fileUrl: track.file_url,
      duration: track.duration,
      genre: track.genre,
      image: track.image,
      createdAt: track.created_at,
    }));
  }

  async deleteSession(sessionId: string) {
    // delete tracks first
    const { error: trackDeleteError } = await supabase
      .from('tracks')
      .delete()
      .eq('session_id', sessionId);

    if (trackDeleteError) {
      console.error('Failed to delete tracks:', trackDeleteError.message);
      throw new Error('Could not delete associated tracks');
    }

    const { data, error } = await supabase
      .from('sessions')
      .delete()
      .eq('id', sessionId)
      .select()
      .maybeSingle();

    if (error) {
      console.error('Delete session error:', error.message);
      throw new Error('Could not delete session');
    }

    if (!data) {
      throw new NotFoundException(`Session with ID ${sessionId} not found`);
    }

    return data;
  }

async saveTrackToSession(data: {
  sessionId: string;
  userId: string;
  title: string;
  artist: string;
  album: string;
  duration?: number;
  genre: string;
  image: string;
  fileUrl: string;
  fileType: string;
}) {
  const { data: inserted, error } = await supabase
    .from('tracks')
    .insert([
      {
        session_id: data.sessionId,
        user_id: data.userId,
        title: data.title,
        artist: data.artist,
        album: data.album,
        duration: data.duration,
        genre: data.genre,
        image: data.image,
        file_url: data.fileUrl,
        file_type: data.fileType,
      },
    ])
    .select();

  if (error) throw new Error(error.message);
  return inserted;
}
}
