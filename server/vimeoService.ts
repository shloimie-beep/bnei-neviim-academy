const VIMEO_ACCESS_TOKEN = process.env.VIMEO_ACCESS_TOKEN;
const VIMEO_CLIENT_ID = process.env.VIMEO_CLIENT_ID;
const VIMEO_CLIENT_SECRET = process.env.VIMEO_CLIENT_SECRET;

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
  private clientId: string;
  private clientSecret: string;
  private cachedToken: string | null = null;
  private tokenExpiry: number = 0;

  constructor() {
    this.accessToken = VIMEO_ACCESS_TOKEN || "";
    this.clientId = VIMEO_CLIENT_ID || "";
    this.clientSecret = VIMEO_CLIENT_SECRET || "";
    
    if (this.accessToken) {
      console.log("[Vimeo] Service initialized with personal access token");
    } else if (this.clientId && this.clientSecret) {
      console.log("[Vimeo] Service initialized with client credentials");
    } else {
      console.log("[Vimeo] No credentials configured - API calls will fail");
    }
  }

  private async getAccessToken(): Promise<string> {
    // Use personal access token if available
    if (this.accessToken) {
      return this.accessToken;
    }

    // Check cached token
    if (this.cachedToken && Date.now() < this.tokenExpiry) {
      return this.cachedToken;
    }

    // Get new token via client credentials grant
    if (!this.clientId || !this.clientSecret) {
      throw new Error("[Vimeo] No credentials configured");
    }

    const credentials = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString("base64");
    
    const response = await fetch("https://api.vimeo.com/oauth/authorize/client", {
      method: "POST",
      headers: {
        "Authorization": `Basic ${credentials}`,
        "Content-Type": "application/json",
        "Accept": "application/vnd.vimeo.*+json;version=3.4",
      },
      body: JSON.stringify({
        grant_type: "client_credentials",
        scope: "public private video_files",
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[Vimeo] Failed to get access token:", response.status, errorText);
      throw new Error(`[Vimeo] Failed to authenticate: ${response.status}`);
    }

    const data = await response.json();
    this.cachedToken = data.access_token;
    // Cache for 1 hour (tokens don't have explicit expiry in client credentials)
    this.tokenExpiry = Date.now() + 3600000;
    
    console.log("[Vimeo] Successfully obtained access token via client credentials");
    return this.cachedToken!;
  }

  // Helper to handle rate limiting with retry
  private async fetchWithRetry(
    url: string,
    options: RequestInit,
    maxRetries: number = 5
  ): Promise<Response> {
    let lastError: Error | null = null;
    
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      const response = await fetch(url, options);
      
      if (response.status === 429) {
        // Rate limited - get retry delay from header or use exponential backoff
        const retryAfter = response.headers.get("Retry-After");
        const waitTime = retryAfter 
          ? parseInt(retryAfter, 10) * 1000 
          : Math.min(1000 * Math.pow(2, attempt), 60000); // Max 60 seconds
        
        console.log(`[Vimeo] Rate limited (429). Waiting ${waitTime/1000}s before retry ${attempt + 1}/${maxRetries}...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
        continue;
      }
      
      return response;
    }
    
    throw new Error(`[Vimeo] Max retries (${maxRetries}) exceeded due to rate limiting`);
  }

  async createVideo(title: string, fileSize: number): Promise<VimeoCreateResponse> {
    const token = await this.getAccessToken();
    const response = await this.fetchWithRetry("https://api.vimeo.com/me/videos", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
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
      const token = await this.getAccessToken();
      for (const domain of domains) {
        await fetch(
          `https://api.vimeo.com/videos/${videoId}/privacy/domains/${domain}`,
          {
            method: "PUT",
            headers: {
              "Authorization": `Bearer ${token}`,
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
      const token = await this.getAccessToken();
      const response = await this.fetchWithRetry(
        `https://api.vimeo.com/me/videos?page=${page}&per_page=${perPage}&fields=uri,name,link,status,duration,pictures,player_embed_url`,
        {
          headers: {
            "Authorization": `Bearer ${token}`,
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
      const token = await this.getAccessToken();
      const response = await this.fetchWithRetry(`https://api.vimeo.com/videos/${videoId}`, {
        headers: {
          "Authorization": `Bearer ${token}`,
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
      const token = await this.getAccessToken();
      
      // Set embed to "public" - allows embedding on any domain
      // View privacy is managed separately on Vimeo (set to private by user)
      const response = await fetch(`https://api.vimeo.com/videos/${videoId}`, {
        method: "PATCH",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
          "Accept": "application/vnd.vimeo.*+json;version=3.4",
        },
        body: JSON.stringify({
          privacy: {
            embed: "public",
          },
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`[Vimeo] Failed to update privacy for ${videoId}: ${response.status} - ${errorText}`);
        return false;
      }

      console.log(`[Vimeo] Updated embed privacy for video ${videoId} to public (embeddable everywhere)`);
      return true;
    } catch (error) {
      console.error(`[Vimeo] Error updating privacy for ${videoId}:`, error);
      return false;
    }
  }

  async deleteVideo(videoId: string): Promise<boolean> {
    try {
      const token = await this.getAccessToken();
      const response = await this.fetchWithRetry(`https://api.vimeo.com/videos/${videoId}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`,
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
