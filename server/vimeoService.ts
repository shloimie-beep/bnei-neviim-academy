const VIMEO_ACCESS_TOKEN = process.env.VIMEO_ACCESS_TOKEN;

interface VimeoVideo {
  uri: string;
  name: string;
  link: string;
  status: string;
  duration: number;
  pictures?: {
    base_link: string;
    sizes?: Array<{ width: number; height: number; link: string }>;
  };
  upload?: {
    upload_link: string;
    approach: string;
  };
  player_embed_url?: string;
  embed?: {
    html?: string;
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
          embed: "public",
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
    
    // Set domain whitelist for the new video
    const videoId = data.uri.split("/").pop();
    if (videoId) {
      await this.setDomainWhitelist(videoId);
    }
    
    return data;
  }

  private async setDomainWhitelist(videoId: string): Promise<void> {
    const domains = [
      "onetimeonetime.com",
      "www.onetimeonetime.com",
      "replit.dev",
      "replit.app",
      "repl.co",
    ];

    try {
      for (const domain of domains) {
        await fetch(
          `https://api.vimeo.com/videos/${videoId}/privacy/domains/${domain}`,
          {
            method: "PUT",
            headers: {
              "Authorization": `Bearer ${this.accessToken}`,
            },
          }
        );
      }
      console.log(`[Vimeo] Set domain whitelist for video ${videoId}`);
    } catch (error) {
      console.error(`[Vimeo] Failed to set domain whitelist for ${videoId}:`, error);
    }
  }

  async listVideos(page: number = 1, perPage: number = 100): Promise<{ items: VimeoVideo[]; totalItems: number }> {
    try {
      const response = await fetch(
        `https://api.vimeo.com/me/videos?page=${page}&per_page=${perPage}&fields=uri,name,link,status,duration,pictures,player_embed_url`,
        {
          headers: {
            "Authorization": `Bearer ${this.accessToken}`,
            "Accept": "application/vnd.vimeo.*+json;version=3.4",
          },
        }
      );

      if (!response.ok) {
        console.error(`[Vimeo] Failed to list videos: ${response.status}`);
        return { items: [], totalItems: 0 };
      }

      const data = await response.json();
      return {
        items: data.data || [],
        totalItems: data.total || 0,
      };
    } catch (error) {
      console.error("[Vimeo] Error listing videos:", error);
      return { items: [], totalItems: 0 };
    }
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

  async updateVideoPrivacy(videoId: string): Promise<boolean> {
    try {
      const response = await fetch(`https://api.vimeo.com/videos/${videoId}`, {
        method: "PATCH",
        headers: {
          "Authorization": `Bearer ${this.accessToken}`,
          "Content-Type": "application/json",
          "Accept": "application/vnd.vimeo.*+json;version=3.4",
        },
        body: JSON.stringify({
          privacy: {
            view: "unlisted",
            embed: "public",
          },
        }),
      });

      if (!response.ok) {
        console.error(`[Vimeo] Failed to update privacy for ${videoId}: ${response.status}`);
        return false;
      }

      console.log(`[Vimeo] Updated privacy for video ${videoId} to unlisted/public`);
      return true;
    } catch (error) {
      console.error(`[Vimeo] Error updating privacy for ${videoId}:`, error);
      return false;
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

  async getSecureEmbedUrl(videoId: string): Promise<string | null> {
    try {
      // First try getting the player_embed_url from Vimeo which includes any necessary hash
      const video = await this.getVideo(videoId);
      if (video?.player_embed_url) {
        const url = new URL(video.player_embed_url);
        url.searchParams.set('dnt', '1');
        url.searchParams.set('title', '0');
        url.searchParams.set('byline', '0');
        url.searchParams.set('portrait', '0');
        return url.toString();
      }
      
      // If player_embed_url not available, use simple public URL
      // (works for unlisted videos with public embed)
      return `https://player.vimeo.com/video/${videoId}?dnt=1&title=0&byline=0&portrait=0`;
    } catch (error) {
      console.error(`[Vimeo] Error getting embed URL for ${videoId}:`, error);
      // Fallback to simple URL
      return `https://player.vimeo.com/video/${videoId}?dnt=1&title=0&byline=0&portrait=0`;
    }
  }

  async getThumbnailUrl(videoId: string): Promise<string | null> {
    try {
      const video = await this.getVideo(videoId);
      if (video?.pictures?.base_link) {
        let url = video.pictures.base_link;
        // Vimeo provides different sizes - append size suffix
        // Handle both URLs with and without query strings
        if (!url.includes('_')) {
          url = url.replace(/\?.*$/, '') + '_640x360';
        }
        return url;
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
