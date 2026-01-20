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
          view: "disable",
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
      "workspace.moshehoffman37.repl.co",
      "moshehoffman37-workspace.replit.dev",
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

  async getSecureEmbedUrl(videoId: string): Promise<string | null> {
    try {
      const video = await this.getVideo(videoId);
      if (!video) return null;

      // Use player_embed_url if available (most reliable for private videos)
      if (video.player_embed_url) {
        // Append additional parameters to hide Vimeo branding
        const url = new URL(video.player_embed_url);
        url.searchParams.set('dnt', '1');
        url.searchParams.set('title', '0');
        url.searchParams.set('byline', '0');
        url.searchParams.set('portrait', '0');
        return url.toString();
      }

      // Extract embed URL from embed.html if available
      if (video.embed?.html) {
        const srcMatch = video.embed.html.match(/src="([^"]+)"/);
        if (srcMatch) {
          const url = new URL(srcMatch[1]);
          url.searchParams.set('dnt', '1');
          url.searchParams.set('title', '0');
          url.searchParams.set('byline', '0');
          url.searchParams.set('portrait', '0');
          return url.toString();
        }
      }

      // For private videos, Vimeo provides a hash in the link
      // e.g., https://vimeo.com/123456789/abc123hash
      const linkMatch = video.link?.match(/vimeo\.com\/\d+\/([a-zA-Z0-9]+)/);
      if (linkMatch) {
        return `https://player.vimeo.com/video/${videoId}?h=${linkMatch[1]}&dnt=1&title=0&byline=0&portrait=0`;
      }

      // Fallback to standard embed
      return `https://player.vimeo.com/video/${videoId}?dnt=1&title=0&byline=0&portrait=0`;
    } catch (error) {
      console.error(`[Vimeo] Error getting secure embed URL for ${videoId}:`, error);
      return null;
    }
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
