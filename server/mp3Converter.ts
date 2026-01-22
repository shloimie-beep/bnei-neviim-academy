import { spawn } from "child_process";
import * as fs from "fs";
import * as path from "path";
import fetch from "node-fetch";
import { getVideo, BUNNY_API_KEY, BUNNY_LIBRARY_ID, getPullZoneHostname } from "./bunnyStream";
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

export async function convertHlsToMp3(bunnyGuid: string, outputPath: string): Promise<void> {
  const pullZone = await getPullZoneHostname();
  const hlsUrl = `https://${pullZone}.b-cdn.net/${bunnyGuid}/playlist.m3u8`;
  
  console.log(`[MP3] Streaming audio from HLS: ${hlsUrl}`);
  
  return new Promise((resolve, reject) => {
    const ffmpeg = spawn("ffmpeg", [
      "-y",
      "-i", hlsUrl,
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
      if (code === 0) {
        console.log(`[MP3] Successfully converted HLS to MP3: ${outputPath}`);
        resolve();
      } else {
        reject(new Error(`FFmpeg HLS conversion failed with code ${code}: ${stderr.slice(-500)}`));
      }
    });
    
    ffmpeg.on("error", (err) => {
      reject(err);
    });
  });
}

export async function convertVimeoToMp3(vimeoVideoId: string, outputPath: string): Promise<void> {
  console.log(`[MP3] Getting playback URL for Vimeo video: ${vimeoVideoId}`);
  
  const playback = await vimeoService.getAuthenticatedPlaybackUrl(vimeoVideoId);
  if (!playback) {
    throw new Error("Could not get Vimeo playback URL");
  }
  
  let inputUrl: string;
  if (playback.type === 'hls') {
    inputUrl = playback.url;
    console.log(`[MP3] Using Vimeo HLS stream`);
  } else if (playback.type === 'progressive') {
    inputUrl = playback.url;
    console.log(`[MP3] Using Vimeo progressive download`);
  } else {
    throw new Error("Vimeo video does not have a downloadable stream (embed-only)");
  }
  
  console.log(`[MP3] Converting Vimeo video to MP3 64kbps mono...`);
  
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
        reject(new Error(`FFmpeg Vimeo conversion failed with code ${code}: ${stderr.slice(-500)}`));
      }
    });
    
    ffmpeg.on("error", (err) => {
      reject(err);
    });
  });
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

export async function getOrCreateMp3(videoId: string, bunnyGuid: string, title: string): Promise<string> {
  const cached = getCachedMp3Path(videoId);
  if (cached) {
    console.log(`[MP3] Serving cached MP3 for video ${videoId}`);
    return cached;
  }
  
  console.log(`[MP3] Converting video ${videoId} to MP3...`);
  
  const safeTitle = sanitizeFilename(title);
  const mp3Filename = `${videoId}_${safeTitle}.mp3`;
  const mp3Path = path.join(MP3_CACHE_DIR, mp3Filename);
  
  await convertHlsToMp3(bunnyGuid, mp3Path);
  
  cacheManifest.set(videoId, {
    videoId,
    mp3Path,
    createdAt: Date.now(),
  });
  saveManifest();
  
  console.log(`[MP3] Created MP3 for video ${videoId}: ${mp3Path}`);
  
  return mp3Path;
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

export async function preGenerateMp3(videoId: string, bunnyGuid: string, title: string, skipStatusCheck: boolean = false): Promise<void> {
  try {
    if (!skipStatusCheck) {
      const bunnyVideo = await getVideo(bunnyGuid);
      if (bunnyVideo.status !== 4) {
        console.log(`[MP3] Video ${videoId} not ready (status ${bunnyVideo.status}), skipping pre-generation`);
        return;
      }
    }
    
    await getOrCreateMp3(videoId, bunnyGuid, title);
  } catch (err) {
    console.error(`[MP3] Failed to pre-generate MP3 for ${videoId}:`, err);
  }
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
