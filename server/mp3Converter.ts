import { spawn } from "child_process";
import * as fs from "fs";
import * as path from "path";
import fetch from "node-fetch";
import { vimeoService } from "./vimeoService";

const MP3_CACHE_DIR = path.join(process.cwd(), "mp3_cache");
const CACHE_DURATION_MS = 7 * 24 * 60 * 60 * 1000;

if (!fs.existsSync(MP3_CACHE_DIR)) {
  fs.mkdirSync(MP3_CACHE_DIR, { recursive: true });
}

interface Mp3CacheEntry {
  videoId: string;
  mp3Path: string;
  createdAt: number;
}

const cacheManifest: Map<string, Mp3CacheEntry> = new Map();
const manifestPath = path.join(MP3_CACHE_DIR, "manifest.json");

function loadManifest() {
  try {
    if (fs.existsSync(manifestPath)) {
      const data = JSON.parse(fs.readFileSync(manifestPath, "utf-8"));
      for (const entry of data) {
        if (fs.existsSync(entry.mp3Path)) {
          cacheManifest.set(entry.videoId, entry);
        }
      }
    }
  } catch (err) {
    console.error("[MP3] Failed to load manifest:", err);
  }
}

function saveManifest() {
  try {
    const data = Array.from(cacheManifest.values());
    fs.writeFileSync(manifestPath, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error("[MP3] Failed to save manifest:", err);
  }
}

loadManifest();

export function getCachedMp3Path(videoId: string): string | null {
  const entry = cacheManifest.get(videoId);
  if (!entry) return null;
  
  const age = Date.now() - entry.createdAt;
  if (age > CACHE_DURATION_MS) {
    try {
      fs.unlinkSync(entry.mp3Path);
    } catch {}
    cacheManifest.delete(videoId);
    saveManifest();
    return null;
  }
  
  if (!fs.existsSync(entry.mp3Path)) {
    cacheManifest.delete(videoId);
    saveManifest();
    return null;
  }
  
  return entry.mp3Path;
}

function sanitizeFilename(name: string): string {
  return name.replace(/[^a-zA-Z0-9_-]/g, "_").substring(0, 50);
}

// Use yt-dlp to extract and convert video to MP3 (works for embed-only videos)
// Uses a two-step process: download best audio with yt-dlp, then convert with ffmpeg
async function convertVimeoWithYtDlp(vimeoVideoId: string, outputPath: string, fullLink?: string): Promise<void> {
  // Use the full link with hash if available (for unlisted videos)
  const vimeoUrl = fullLink || `https://vimeo.com/${vimeoVideoId}`;
  console.log(`[MP3] Using yt-dlp to extract audio from: ${vimeoUrl}`);
  
  const tempVideoPath = outputPath.replace(/\.mp3$/, `_temp_${Date.now()}.mp4`);
  
  try {
    // Step 1: Download best audio stream with yt-dlp
    await new Promise<void>((resolve, reject) => {
      const ytdlp = spawn("yt-dlp", [
        "--no-warnings",
        "--no-check-certificate",
        "-f", "bestaudio/best",  // Get best audio quality
        "-o", tempVideoPath,
        vimeoUrl,
      ]);
      
      let stderr = "";
      
      ytdlp.stdout.on("data", (data) => {
        console.log(`[yt-dlp] ${data.toString().trim()}`);
      });
      
      ytdlp.stderr.on("data", (data) => {
        stderr += data.toString();
      });
      
      ytdlp.on("close", (code) => {
        if (code === 0 && fs.existsSync(tempVideoPath)) {
          console.log(`[MP3] Downloaded audio stream to: ${tempVideoPath}`);
          resolve();
        } else {
          reject(new Error(`yt-dlp failed with code ${code}: ${stderr.slice(-500)}`));
        }
      });
      
      ytdlp.on("error", reject);
    });
    
    // Step 2: Convert to MP3 with ffmpeg
    await new Promise<void>((resolve, reject) => {
      const ffmpeg = spawn("ffmpeg", [
        "-y",
        "-i", tempVideoPath,
        "-vn",
        "-acodec", "libmp3lame",
        "-ab", "64k",
        "-ar", "22050",
        "-ac", "1",
        outputPath,
      ]);
      
      let stderr = "";
      
      ffmpeg.stderr.on("data", (data) => {
        stderr += data.toString();
      });
      
      ffmpeg.on("close", (code) => {
        if (code === 0 && fs.existsSync(outputPath)) {
          console.log(`[MP3] Successfully converted to MP3: ${outputPath}`);
          resolve();
        } else {
          reject(new Error(`FFmpeg conversion failed with code ${code}: ${stderr.slice(-500)}`));
        }
      });
      
      ffmpeg.on("error", reject);
    });
  } finally {
    // Always clean up temp file
    if (fs.existsSync(tempVideoPath)) {
      try {
        fs.unlinkSync(tempVideoPath);
        console.log(`[MP3] Cleaned up temp file: ${tempVideoPath}`);
      } catch (e) {
        console.error(`[MP3] Failed to clean up temp file: ${tempVideoPath}`);
      }
    }
  }
}

export async function convertVimeoToMp3(vimeoVideoId: string, outputPath: string): Promise<void> {
  console.log(`[MP3] Getting playback URL for Vimeo video: ${vimeoVideoId}`);
  
  // Get the full video link with hash for unlisted videos (needed for yt-dlp)
  const videoLink = await vimeoService.getVideoLink(vimeoVideoId);
  
  const playback = await vimeoService.getAuthenticatedPlaybackUrl(vimeoVideoId);
  
  // If we got a usable stream URL from the API, use ffmpeg directly
  if (playback && (playback.type === 'hls' || playback.type === 'progressive')) {
    const inputUrl = playback.url;
    console.log(`[MP3] Using Vimeo ${playback.type} stream with ffmpeg`);
    
    return new Promise((resolve, reject) => {
      const ffmpeg = spawn("ffmpeg", [
        "-y",
        "-i", inputUrl,
        "-vn",
        "-acodec", "libmp3lame",
        "-ab", "64k",
        "-ar", "22050",
        "-ac", "1",
        outputPath,
      ]);
      
      let stderr = "";
      
      ffmpeg.stderr.on("data", (data) => {
        stderr += data.toString();
      });
      
      ffmpeg.on("close", (code) => {
        if (code === 0) {
          console.log(`[MP3] Successfully converted Vimeo video to MP3: ${outputPath}`);
          resolve();
        } else {
          // FFmpeg failed, try yt-dlp as fallback with full link
          console.log(`[MP3] FFmpeg failed, trying yt-dlp fallback...`);
          convertVimeoWithYtDlp(vimeoVideoId, outputPath, videoLink || undefined)
            .then(resolve)
            .catch(reject);
        }
      });
      
      ffmpeg.on("error", (err) => {
        // FFmpeg error, try yt-dlp as fallback with full link
        console.log(`[MP3] FFmpeg error, trying yt-dlp fallback...`);
        convertVimeoWithYtDlp(vimeoVideoId, outputPath, videoLink || undefined)
          .then(resolve)
          .catch(reject);
      });
    });
  }
  
  // No API stream available - use yt-dlp directly with full link (handles embed-only videos)
  console.log(`[MP3] No API stream available, using yt-dlp for embed-only video`);
  return convertVimeoWithYtDlp(vimeoVideoId, outputPath, videoLink || undefined);
}

export async function convertToMp3(inputBuffer: Buffer, outputPath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const tempInputPath = path.join(MP3_CACHE_DIR, `temp_input_${Date.now()}`);
    
    fs.writeFileSync(tempInputPath, inputBuffer);
    
    const ffmpeg = spawn("ffmpeg", [
      "-y",
      "-i", tempInputPath,
      "-vn",
      "-acodec", "libmp3lame",
      "-ab", "128k",
      "-ar", "44100",
      "-ac", "2",
      outputPath,
    ]);
    
    let stderr = "";
    
    ffmpeg.stderr.on("data", (data) => {
      stderr += data.toString();
    });
    
    ffmpeg.on("close", (code) => {
      try {
        fs.unlinkSync(tempInputPath);
      } catch {}
      
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`FFmpeg exited with code ${code}: ${stderr.slice(-500)}`));
      }
    });
    
    ffmpeg.on("error", (err) => {
      try {
        fs.unlinkSync(tempInputPath);
      } catch {}
      reject(err);
    });
  });
}

export async function getOrCreateVimeoMp3(videoId: string, vimeoVideoId: string, title: string): Promise<string> {
  const cached = getCachedMp3Path(videoId);
  if (cached) {
    console.log(`[MP3] Serving cached MP3 for Vimeo video ${videoId}`);
    return cached;
  }
  
  console.log(`[MP3] Converting Vimeo video ${videoId} (${vimeoVideoId}) to MP3...`);
  
  const safeTitle = sanitizeFilename(title);
  const mp3Filename = `${videoId}_${safeTitle}.mp3`;
  const mp3Path = path.join(MP3_CACHE_DIR, mp3Filename);
  
  await convertVimeoToMp3(vimeoVideoId, mp3Path);
  
  cacheManifest.set(videoId, {
    videoId,
    mp3Path,
    createdAt: Date.now(),
  });
  saveManifest();
  
  console.log(`[MP3] Created MP3 for Vimeo video ${videoId}: ${mp3Path}`);
  
  return mp3Path;
}

export function cleanupOldMp3Files(): void {
  console.log("[MP3] Running cleanup for expired files...");
  
  const now = Date.now();
  let cleaned = 0;
  
  const entries = Array.from(cacheManifest.entries());
  for (const [videoId, entry] of entries) {
    const age = now - entry.createdAt;
    if (age > CACHE_DURATION_MS) {
      try {
        if (fs.existsSync(entry.mp3Path)) {
          fs.unlinkSync(entry.mp3Path);
        }
        cacheManifest.delete(videoId);
        cleaned++;
      } catch (err) {
        console.error(`[MP3] Failed to clean up ${entry.mp3Path}:`, err);
      }
    }
  }
  
  if (cleaned > 0) {
    saveManifest();
    console.log(`[MP3] Cleaned up ${cleaned} expired MP3 files`);
  }
}

setInterval(cleanupOldMp3Files, 6 * 60 * 60 * 1000);

export { MP3_CACHE_DIR };
