import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import * as cheerio from 'cheerio';

@Injectable()
export class LyricsService {
  private readonly logger = new Logger(LyricsService.name);
  private readonly GENIUS_API_KEY = process.env.GENIUS_API_KEY;
  private readonly GENIUS_API_URL = 'https://api.genius.com';

  async fetchLyrics(title: string, artist?: string): Promise<string> {
    try {
      if (!this.GENIUS_API_KEY) {
        throw new Error('Genius API key not configured');
      }

      // Step 1: Search for the song
      const searchQuery = artist ? `${title} ${artist}` : title;
      const searchUrl = `${this.GENIUS_API_URL}/search?q=${encodeURIComponent(searchQuery)}`;
      
      this.logger.log(`Searching Genius for: ${searchQuery}`);
      
      const searchResponse = await axios.get(searchUrl, {
        headers: { Authorization: `Bearer ${this.GENIUS_API_KEY}` }
      });

      const firstHit = searchResponse.data.response?.hits?.[0]?.result;
      if (!firstHit) {
        throw new Error('No matching song found');
      }

      // Step 2: Scrape the lyrics page
      this.logger.log(`Found song: ${firstHit.title} - ${firstHit.primary_artist.name}`);
      return await this.scrapeLyrics(firstHit.url);
    } catch (error) {
      this.logger.error(`Lyrics fetch failed: ${error.message}`);
      throw error;
    }
  }

  private async scrapeLyrics(url: string): Promise<string> {
    try {
      const { data } = await axios.get(url);
      const $ = cheerio.load(data);
      
      let lyrics = $('div[class^="Lyrics__Container"]').text().trim();
      
      if (!lyrics) {
        // Fallback to older format if needed
        lyrics = $('.lyrics').text().trim();
      }

      if (!lyrics) {
        throw new Error('Could not extract lyrics from page');
      }

      // Clean up the lyrics
      return lyrics.replace(/(\[.*?\])/g, '\n$1\n') // Preserve [Verse] tags
                  .replace(/\n{3,}/g, '\n\n'); // Remove excessive newlines
    } catch (error) {
      throw new Error(`Failed to scrape lyrics: ${error.message}`);
    }
  }
}