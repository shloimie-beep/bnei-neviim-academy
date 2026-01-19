import { exec } from "child_process";
import { promisify } from "util";
import * as fs from "fs";
import * as path from "path";
import { ObjectStorageService, objectStorageClient } from "./replit_integrations/object_storage";

import { createVideo, uploadThumbnail } from "./bunnyStream";

const execAsync = promisify(exec);
const objectStorageService = new ObjectStorageService();

const BUNNY_CDN_HOSTNAME = process.env.BUNNY_CDN_HOSTNAME;
const BUNNY_LIBRARY_ID = process.env.BUNNY_LIBRARY_ID;

const tempDir = path.join(process.cwd(), "uploads", "temp");
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
}

export async function generateThumbnailFromBunny(
  videoId: string,
  bunnyGuid: string,
  timeOffset: number = 10
): Promise<string | null> {
  const tempThumbnailPath = path.join(tempDir, `${videoId}_thumb.jpg`);

  try {
    const cdnHostname = BUNNY_CDN_HOSTNAME || `vz-${BUNNY_LIBRARY_ID}`;
    const videoUrl = `https://${cdnHostname}.b-cdn.net/${bunnyGuid}/play_720p.mp4`;
    
    console.log(`[Thumbnail] Generating thumbnail for video ${videoId} from ${videoUrl}`);

    await execAsync(
      `ffmpeg -y -ss ${timeOffset} -i "${videoUrl}" -vframes 1 -q:v 2 -vf "scale=640:-1" "${tempThumbnailPath}"`,
      { timeout: 60000 }
    );

    if (!fs.existsSync(tempThumbnailPath)) {
      console.error(`[Thumbnail] Failed to generate thumbnail file`);
      return null;
    }

    // Upload to object storage (our server) instead of Bunny
    const uploadURL = await objectStorageService.getObjectEntityUploadURL();
    const objectPath = objectStorageService.normalizeObjectEntityPath(uploadURL);

    const url = new URL(uploadURL);
    const pathParts = url.pathname.slice(1).split("/");
    const bucketName = pathParts[0];
    const objectName = pathParts.slice(1).join("/");

    const bucket = objectStorageClient.bucket(bucketName);
    const objectFile = bucket.file(objectName);

    await new Promise<void>((resolve, reject) => {
      const readStream = fs.createReadStream(tempThumbnailPath);
      const writeStream = objectFile.createWriteStream({
        resumable: false,
        contentType: "image/jpeg",
      });
      readStream.on("error", reject);
      writeStream.on("error", reject);
      writeStream.on("finish", resolve);
      readStream.pipe(writeStream);
    });

    fs.unlinkSync(tempThumbnailPath);

    console.log(`[Thumbnail] Generated and uploaded thumbnail to ${objectPath}`);
    return objectPath;
  } catch (error: any) {
    console.error(`[Thumbnail] Error generating thumbnail:`, error.message);
    if (fs.existsSync(tempThumbnailPath)) fs.unlinkSync(tempThumbnailPath);
    return null;
  }
}

// Check if a file is an audio file based on extension
function isAudioFile(filepath: string): boolean {
  const audioExtensions = [".mp3", ".wav", ".ogg", ".m4a", ".aac", ".flac", ".wma"];
  const ext = path.extname(filepath).toLowerCase();
  return audioExtensions.includes(ext);
}

export async function generateThumbnailFromLocalVideo(
  videoId: string,
  videoPath: string,
  timeOffset: number = 5
): Promise<string | null> {
  // Skip audio files - they can't have video thumbnails
  if (isAudioFile(videoPath)) {
    console.log(`[Thumbnail] Skipping audio file ${videoId}`);
    return null;
  }

  const tempThumbnailPath = path.join(tempDir, `${videoId}_thumb.jpg`);

  try {
    let inputPath = videoPath;
    
    if (videoPath.startsWith("/objects/")) {
      const objectFile = await objectStorageService.getObjectEntityFile(videoPath);
      const tempVideoPath = path.join(tempDir, `${videoId}_source.mp4`);
      
      await new Promise<void>((resolve, reject) => {
        const writeStream = fs.createWriteStream(tempVideoPath);
        objectFile.createReadStream()
          .on("error", reject)
          .pipe(writeStream)
          .on("finish", resolve)
          .on("error", reject);
      });
      
      inputPath = tempVideoPath;
    }

    console.log(`[Thumbnail] Generating thumbnail for video ${videoId} from local file`);

    await execAsync(
      `ffmpeg -y -ss ${timeOffset} -i "${inputPath}" -vframes 1 -q:v 2 -vf "scale=640:-1" "${tempThumbnailPath}"`,
      { timeout: 60000 }
    );

    if (inputPath !== videoPath && fs.existsSync(inputPath)) {
      fs.unlinkSync(inputPath);
    }

    if (!fs.existsSync(tempThumbnailPath)) {
      console.error(`[Thumbnail] Failed to generate thumbnail file`);
      return null;
    }

    const uploadURL = await objectStorageService.getObjectEntityUploadURL();
    const objectPath = objectStorageService.normalizeObjectEntityPath(uploadURL);

    const url = new URL(uploadURL);
    const pathParts = url.pathname.slice(1).split("/");
    const bucketName = pathParts[0];
    const objectName = pathParts.slice(1).join("/");

    const bucket = objectStorageClient.bucket(bucketName);
    const objectFile = bucket.file(objectName);

    await new Promise<void>((resolve, reject) => {
      const readStream = fs.createReadStream(tempThumbnailPath);
      const writeStream = objectFile.createWriteStream({
        resumable: false,
        contentType: "image/jpeg",
      });
      readStream.on("error", reject);
      writeStream.on("error", reject);
      writeStream.on("finish", resolve);
      readStream.pipe(writeStream);
    });

    fs.unlinkSync(tempThumbnailPath);

    console.log(`[Thumbnail] Generated and uploaded thumbnail to ${objectPath}`);
    return objectPath;
  } catch (error: any) {
    console.error(`[Thumbnail] Error generating thumbnail:`, error.message);
    
    if (fs.existsSync(tempThumbnailPath)) fs.unlinkSync(tempThumbnailPath);
    
    return null;
  }
}
