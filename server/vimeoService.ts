const VIMEO_ACCESS_TOKEN = process.env.VIMEO_ACCESS_TOKEN;

interface VimeoVideo {
  uri: string;
  name: string;
  link: string;
  status: string;
  duration: number;
  pictures?: {
    base_link: string;
  };
  upload?: {
    upload_link: string;
    approach: string;
  };
}

interface VimeoCreateResponse {
  uri: string;
  name: string;
  link: string;
  upload: {
    upload_link: string;
    approach: string;
  };
}

class VimeoService {
  private accessToken: string;

  constructor() {
    this.accessToken = VIMEO_ACCESS_TOKEN || "";
    if (this.accessToken) {
      console.log("[Vimeo] Service initialized");
    } else {
      console.log("[Vimeo] Access token not configured - uploads will fail");
    }
  }

  async createVideo(title: string, fileSize: number): Promise<VimeoCreateResponse> {
    const response = await fetch("https://api.vimeo.com/me/videos", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${this.accessToken}`,
        "Content-Type": "application/json",
        "Accept": "application/vnd.vimeo.*+json;version=3.4",
      },
      body: JSON.stringify({
        upload: {
          approach: "tus",
          size: fileSize,
        },
        name: title,
        privacy: {
          view: "unlisted",
          embed: "whitelist",
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[Vimeo] Create video error: ${response.status} - ${errorText}`);
      throw new Error(`Failed to create Vimeo video: ${response.status}`);
    }

    const data = await response.json();
    console.log(`[Vimeo] Created video: ${data.uri}`);
    return data;
  }

  async getVideo(videoId: string): Promise<VimeoVideo | null> {
    try {
      const response = await fetch(`https://api.vimeo.com/videos/${videoId}`, {
        headers: {
          "Authorization": `Bearer ${this.accessToken}`,
          "Accept": "application/vnd.vimeo.*+json;version=3.4",
        },
      });

      if (!response.ok) {
        return null;
      }

      return await response.json();
    } catch (error) {
      console.error(`[Vimeo] Error getting video ${videoId}:`, error);
      return null;
    }
  }

  async deleteVideo(videoId: string): Promise<boolean> {
    try {
      const response = await fetch(`https://api.vimeo.com/videos/${videoId}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${this.accessToken}`,
        },
      });

      return response.ok || response.status === 204;
    } catch (error) {
      console.error(`[Vimeo] Error deleting video ${videoId}:`, error);
      return false;
    }
  }

  getEmbedUrl(videoId: string): string {
    return `https://player.vimeo.com/video/${videoId}`;
  }

  async getThumbnailUrl(videoId: string): Promise<string | null> {
    try {
      const video = await this.getVideo(videoId);
      if (video?.pictures?.base_link) {
        // Vimeo provides different sizes, get a reasonable one
        return video.pictures.base_link.replace('?', '_640x360?');
      }
      return null;
    } catch (error) {
      console.error(`[Vimeo] Error getting thumbnail for ${videoId}:`, error);
      return null;
    }
  }

  extractVideoId(uri: string): string {
    return uri.replace("/videos/", "");
  }
}

export const vimeoService = new VimeoService();
export { VimeoVideo, VimeoCreateResponse };
