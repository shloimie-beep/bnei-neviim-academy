import fs from "fs";
import path from "path";

const BUNNY_STORAGE_ZONE = process.env.BUNNY_STORAGE_ZONE;
const BUNNY_STORAGE_PASSWORD = process.env.BUNNY_STORAGE_PASSWORD;
const BUNNY_STORAGE_CDN = process.env.BUNNY_STORAGE_CDN;

const STORAGE_HOSTNAME = "storage.bunnycdn.com";

export function isBunnyStorageConfigured(): boolean {
  return !!(BUNNY_STORAGE_ZONE && BUNNY_STORAGE_PASSWORD && BUNNY_STORAGE_CDN);
}

export function getBunnyCdnUrl(filename: string): string {
  if (!BUNNY_STORAGE_CDN) {
    throw new Error("BUNNY_STORAGE_CDN not configured");
  }
  const cdnHost = BUNNY_STORAGE_CDN.replace(/^https?:\/\//, "").replace(/\/$/, "");
  return `https://${cdnHost}/audio/${filename}`;
}

export async function uploadAudioToBunny(
  localFilePath: string,
  filename: string
): Promise<{ cdnUrl: string; storagePath: string }> {
  if (!BUNNY_STORAGE_ZONE || !BUNNY_STORAGE_PASSWORD) {
    throw new Error("Bunny Storage credentials not configured");
  }

  const fileBuffer = fs.readFileSync(localFilePath);
  const storagePath = `audio/${filename}`;
  
  const url = `https://${STORAGE_HOSTNAME}/${BUNNY_STORAGE_ZONE}/${storagePath}`;
  
  console.log(`[BunnyStorage] Uploading to: ${url}`);
  
  const response = await fetch(url, {
    method: "PUT",
    headers: {
      "AccessKey": BUNNY_STORAGE_PASSWORD,
      "Content-Type": "application/octet-stream",
    },
    body: fileBuffer,
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`[BunnyStorage] Upload failed: ${response.status} - ${errorText}`);
    throw new Error(`Bunny Storage upload failed: ${response.status}`);
  }

  console.log(`[BunnyStorage] Upload successful: ${storagePath}`);
  
  const cdnUrl = getBunnyCdnUrl(filename);
  
  return {
    cdnUrl,
    storagePath,
  };
}

export async function deleteAudioFromBunny(storagePath: string): Promise<void> {
  if (!BUNNY_STORAGE_ZONE || !BUNNY_STORAGE_PASSWORD) {
    throw new Error("Bunny Storage credentials not configured");
  }

  const url = `https://${STORAGE_HOSTNAME}/${BUNNY_STORAGE_ZONE}/${storagePath}`;
  
  console.log(`[BunnyStorage] Deleting: ${url}`);
  
  const response = await fetch(url, {
    method: "DELETE",
    headers: {
      "AccessKey": BUNNY_STORAGE_PASSWORD,
    },
  });

  if (!response.ok && response.status !== 404) {
    const errorText = await response.text();
    console.error(`[BunnyStorage] Delete failed: ${response.status} - ${errorText}`);
    throw new Error(`Bunny Storage delete failed: ${response.status}`);
  }

  console.log(`[BunnyStorage] Delete successful or file not found: ${storagePath}`);
}

export function initializeBunnyStorage(): void {
  if (isBunnyStorageConfigured()) {
    console.log(`[BunnyStorage] Service initialized with zone: ${BUNNY_STORAGE_ZONE}`);
    console.log(`[BunnyStorage] CDN hostname: ${BUNNY_STORAGE_CDN}`);
  } else {
    console.log("[BunnyStorage] Not configured - audio files will be stored locally");
  }
}
