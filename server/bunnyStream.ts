const BUNNY_API_KEY = process.env.BUNNY_API_KEY;
const BUNNY_LIBRARY_ID = process.env.BUNNY_LIBRARY_ID;

const BUNNY_API_BASE = "https://video.bunnycdn.com/library";

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

export function getEmbedUrl(videoGuid: string): string {
  return `https://iframe.mediadelivery.net/embed/${BUNNY_LIBRARY_ID}/${videoGuid}`;
}

export function getThumbnailUrl(videoGuid: string): string {
  return `https://vz-${BUNNY_LIBRARY_ID}.b-cdn.net/${videoGuid}/thumbnail.jpg`;
}

export function getUploadUrl(videoGuid: string): string {
  if (!BUNNY_LIBRARY_ID) {
    throw new Error("Bunny Library ID not configured");
  }
  return `${BUNNY_API_BASE}/${BUNNY_LIBRARY_ID}/videos/${videoGuid}`;
}

export { BUNNY_API_KEY, BUNNY_LIBRARY_ID };
