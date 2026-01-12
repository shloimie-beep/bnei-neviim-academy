const BUNNY_API_KEY = process.env.BUNNY_API_KEY;
const BUNNY_LIBRARY_ID = process.env.BUNNY_LIBRARY_ID;
const BUNNY_CDN_HOSTNAME = process.env.BUNNY_CDN_HOSTNAME;

const BUNNY_API_BASE = "https://video.bunnycdn.com/library";

// Cache for the CDN hostname
let cachedPullZone: string | null = null;

async function getPullZoneHostname(): Promise<string> {
  if (cachedPullZone) return cachedPullZone;
  
  // Use environment variable if set
  if (BUNNY_CDN_HOSTNAME) {
    cachedPullZone = BUNNY_CDN_HOSTNAME;
    console.log(`[Bunny] Using configured CDN hostname: ${cachedPullZone}`);
    return cachedPullZone;
  }
  
  // Fallback to library ID format (may not work for all accounts)
  cachedPullZone = `vz-${BUNNY_LIBRARY_ID}`;
  console.log(`[Bunny] Using default CDN hostname: ${cachedPullZone}`);
  return cachedPullZone;
}

interface BunnyVideo {
  guid: string;
  title: string;
  dateUploaded: string;
  views: number;
  isPublic: boolean;
  length: number;
  status: number;
  framerate: number;
  width: number;
  height: number;
  availableResolutions: string;
  thumbnailCount: number;
  encodeProgress: number;
  storageSize: number;
  captions: any[];
  hasMP4Fallback: boolean;
  collectionId: string;
  thumbnailFileName: string;
}

interface CreateVideoResponse {
  guid: string;
  title: string;
}

export async function createVideo(title: string): Promise<CreateVideoResponse> {
  if (!BUNNY_API_KEY || !BUNNY_LIBRARY_ID) {
    throw new Error("Bunny Stream credentials not configured");
  }

  const response = await fetch(`${BUNNY_API_BASE}/${BUNNY_LIBRARY_ID}/videos`, {
    method: "POST",
    headers: {
      "AccessKey": BUNNY_API_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ title }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to create video: ${error}`);
  }

  return response.json();
}

export async function uploadVideo(videoGuid: string, fileBuffer: Buffer): Promise<void> {
  if (!BUNNY_API_KEY || !BUNNY_LIBRARY_ID) {
    throw new Error("Bunny Stream credentials not configured");
  }

  const response = await fetch(`${BUNNY_API_BASE}/${BUNNY_LIBRARY_ID}/videos/${videoGuid}`, {
    method: "PUT",
    headers: {
      "AccessKey": BUNNY_API_KEY,
      "Content-Type": "application/octet-stream",
    },
    body: fileBuffer,
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to upload video: ${error}`);
  }
}

export async function getVideo(videoGuid: string): Promise<BunnyVideo> {
  if (!BUNNY_API_KEY || !BUNNY_LIBRARY_ID) {
    throw new Error("Bunny Stream credentials not configured");
  }

  const response = await fetch(`${BUNNY_API_BASE}/${BUNNY_LIBRARY_ID}/videos/${videoGuid}`, {
    method: "GET",
    headers: {
      "AccessKey": BUNNY_API_KEY,
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to get video: ${error}`);
  }

  return response.json();
}

export async function deleteVideo(videoGuid: string): Promise<void> {
  if (!BUNNY_API_KEY || !BUNNY_LIBRARY_ID) {
    throw new Error("Bunny Stream credentials not configured");
  }

  const response = await fetch(`${BUNNY_API_BASE}/${BUNNY_LIBRARY_ID}/videos/${videoGuid}`, {
    method: "DELETE",
    headers: {
      "AccessKey": BUNNY_API_KEY,
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to delete video: ${error}`);
  }
}

export async function listVideos(page: number = 1, itemsPerPage: number = 100): Promise<{ items: BunnyVideo[]; totalItems: number }> {
  if (!BUNNY_API_KEY || !BUNNY_LIBRARY_ID) {
    throw new Error("Bunny Stream credentials not configured");
  }

  const response = await fetch(`${BUNNY_API_BASE}/${BUNNY_LIBRARY_ID}/videos?page=${page}&itemsPerPage=${itemsPerPage}`, {
    method: "GET",
    headers: {
      "AccessKey": BUNNY_API_KEY,
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to list videos: ${error}`);
  }

  return response.json();
}

export async function uploadThumbnail(videoGuid: string, thumbnailBuffer: Buffer): Promise<void> {
  if (!BUNNY_API_KEY || !BUNNY_LIBRARY_ID) {
    throw new Error("Bunny Stream credentials not configured");
  }

  const response = await fetch(`${BUNNY_API_BASE}/${BUNNY_LIBRARY_ID}/videos/${videoGuid}/thumbnail`, {
    method: "POST",
    headers: {
      "AccessKey": BUNNY_API_KEY,
      "Content-Type": "image/jpeg",
    },
    body: thumbnailBuffer,
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to upload thumbnail: ${error}`);
  }
}

export function getEmbedUrl(videoGuid: string): string {
  return `https://iframe.mediadelivery.net/embed/${BUNNY_LIBRARY_ID}/${videoGuid}`;
}

export async function getThumbnailUrl(videoGuid: string): Promise<string> {
  const pullZone = await getPullZoneHostname();
  return `https://${pullZone}.b-cdn.net/${videoGuid}/thumbnail.jpg`;
}

// Synchronous version for cases where we can't await
export function getThumbnailUrlSync(videoGuid: string): string {
  if (cachedPullZone) {
    return `https://${cachedPullZone}.b-cdn.net/${videoGuid}/thumbnail.jpg`;
  }
  // Fallback - this should rarely happen after initialization
  return `https://vz-${BUNNY_LIBRARY_ID}.b-cdn.net/${videoGuid}/thumbnail.jpg`;
}

export function getUploadUrl(videoGuid: string): string {
  if (!BUNNY_LIBRARY_ID) {
    throw new Error("Bunny Library ID not configured");
  }
  return `${BUNNY_API_BASE}/${BUNNY_LIBRARY_ID}/videos/${videoGuid}`;
}

interface LibrarySettings {
  AllowedReferrers?: string[];
  BlockedReferrers?: string[];
  EnableDRM?: boolean;
  PlayerKeyColor?: string;
  FontFamily?: string;
  ShowHeatmap?: boolean;
  EnableContentTagging?: boolean;
}

export async function getLibrarySettings(): Promise<any> {
  if (!BUNNY_API_KEY || !BUNNY_LIBRARY_ID) {
    throw new Error("Bunny Stream credentials not configured");
  }

  const response = await fetch(`${BUNNY_API_BASE}/${BUNNY_LIBRARY_ID}`, {
    method: "GET",
    headers: {
      "AccessKey": BUNNY_API_KEY,
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to get library settings: ${error}`);
  }

  return response.json();
}

export async function updateLibrarySettings(settings: LibrarySettings): Promise<void> {
  if (!BUNNY_API_KEY || !BUNNY_LIBRARY_ID) {
    throw new Error("Bunny Stream credentials not configured");
  }

  const response = await fetch(`${BUNNY_API_BASE}/${BUNNY_LIBRARY_ID}`, {
    method: "POST",
    headers: {
      "AccessKey": BUNNY_API_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(settings),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to update library settings: ${error}`);
  }
}

export async function setAllowedReferrers(domains: string[]): Promise<void> {
  await updateLibrarySettings({ AllowedReferrers: domains });
}

// Initialize pull zone cache on module load
export async function initializeBunnyStream(): Promise<void> {
  try {
    if (BUNNY_API_KEY && BUNNY_LIBRARY_ID) {
      await getPullZoneHostname();
      console.log("[Bunny] Stream service initialized");
    }
  } catch (err) {
    console.error("[Bunny] Failed to initialize:", err);
  }
}

export { BUNNY_API_KEY, BUNNY_LIBRARY_ID };
