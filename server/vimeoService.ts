const VIMEO_ACCESS_TOKEN = process.env.VIMEO_ACCESS_TOKEN;
const VIMEO_CLIENT_ID = process.env.VIMEO_CLIENT_ID;
const VIMEO_CLIENT_SECRET = process.env.VIMEO_CLIENT_SECRET;
// VIMEO_CUSTOMER_TOKEN is an alternative API key for upload operations
const VIMEO_CUSTOMER_TOKEN = process.env.VIMEO_CUSTOMER_TOKEN;

interface VimeoVideoFile {
  quality: string;
  type: string;
  width: number;
  height: number;
  link: string;
  expires: string;
}

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
  privacy?: {
    view: string;
    embed: string;
  };
  files?: VimeoVideoFile[];
  play?: {
    hls?: { link: string };
    dash?: { link: string };
    progressive?: VimeoVideoFile[];
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
  private customerToken: string;
  private clientId: string;
  private clientSecret: string;
  private cachedToken: string | null = null;
  private tokenExpiry: number = 0;

  constructor() {
    this.accessToken = VIMEO_ACCESS_TOKEN || "";
    this.customerToken = VIMEO_CUSTOMER_TOKEN || "";
    this.clientId = VIMEO_CLIENT_ID || "";
    this.clientSecret = VIMEO_CLIENT_SECRET || "";
    
    if (this.accessToken) {
      console.log("[Vimeo] Service initialized with personal access token");
    }
    if (this.customerToken) {
      console.log("[Vimeo] Customer token available for uploads");
    }
    if (this.clientId && this.clientSecret) {
      console.log("[Vimeo] Client credentials available");
    }
    if (!this.accessToken && !this.customerToken && !this.clientId) {
      console.log("[Vimeo] No credentials configured - API calls will fail");
    }
  }

  // Get token for upload operations - prefer customer token if available
  private getUploadToken(): string {
    // Customer token takes priority for upload operations
    if (this.customerToken) {
      return this.customerToken;
    }
    return this.accessToken;
  }

  // Get token for download/playback operations - prefer customer token (master key) for full access
  private getDownloadToken(): string {
    // Customer token (master API key) has full access including download permissions
    if (this.customerToken) {
      console.log("[Vimeo] Using customer token (master key) for download");
      return this.customerToken;
    }
    return this.accessToken;
  }

  // Get download link directly from Vimeo API (for PRO/Business accounts with download access)
  async getDownloadLink(videoId: string): Promise<{ type: 'progressive', url: string, quality: string } | null> {
    try {
      // Try both tokens - customer token first, then access token
      const tokens = [this.customerToken, this.accessToken].filter(Boolean);
      
      for (const token of tokens) {
        console.log(`[Vimeo] Requesting download links for video ${videoId}...`);
        
        // Request the video with download field
        const response = await this.fetchWithRetry(
          `https://api.vimeo.com/videos/${videoId}?fields=uri,name,download,files,status`,
          {
            headers: {
              "Authorization": `Bearer ${token}`,
              "Accept": "application/vnd.vimeo.*+json;version=3.4",
            },
          }
        );

        if (!response.ok) {
          console.log(`[Vimeo] Download request failed with status ${response.status}`);
          continue;
        }

        const data = await response.json() as any;
        
        // Check for download field (source files available on PRO+ accounts)
        if (data.download && Array.isArray(data.download) && data.download.length > 0) {
          // Sort by quality (prefer source or highest quality)
          const downloads = data.download.sort((a: any, b: any) => {
            // Prefer source file
            if (a.quality === 'source') return -1;
            if (b.quality === 'source') return 1;
            // Then by resolution
            return (b.height || 0) - (a.height || 0);
          });
          
          const best = downloads[0];
          console.log(`[Vimeo] Found download link: ${best.quality} (${best.type})`);
          return { 
            type: 'progressive', 
            url: best.link,
            quality: best.quality
          };
        }
        
        // Also check files field
        if (data.files && Array.isArray(data.files) && data.files.length > 0) {
          const mp4Files = data.files.filter((f: any) => f.type === 'video/mp4');
          if (mp4Files.length > 0) {
            const sorted = mp4Files.sort((a: any, b: any) => (b.height || 0) - (a.height || 0));
            const best = sorted[0];
            console.log(`[Vimeo] Found file link: ${best.quality} (${best.type})`);
            return {
              type: 'progressive',
              url: best.link,
              quality: best.quality
            };
          }
        }
        
        console.log(`[Vimeo] No download/files available in API response`);
      }
      
      return null;
    } catch (error) {
      console.error(`[Vimeo] Error getting download link for ${videoId}:`, error);
      return null;
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
    // Use customer token for uploads if available (has upload permission)
    const token = this.getUploadToken() || await this.getAccessToken();
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
          view: "unlisted",  // Unlisted - accessible via link but not searchable
          embed: "public",   // Embeddable anywhere
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

  // Get the full video link including hash for unlisted videos
  async getVideoLink(videoId: string): Promise<string | null> {
    try {
      const token = this.getDownloadToken();
      const response = await this.fetchWithRetry(`https://api.vimeo.com/videos/${videoId}?fields=link`, {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Accept": "application/vnd.vimeo.*+json;version=3.4",
        },
      });

      if (!response.ok) {
        console.log(`[Vimeo] Failed to get video link for ${videoId}: ${response.status}`);
        return null;
      }

      const data = await response.json() as { link?: string };
      if (data.link) {
        console.log(`[Vimeo] Got video link: ${data.link}`);
        return data.link;
      }
      return null;
    } catch (error) {
      console.error(`[Vimeo] Error getting video link for ${videoId}:`, error);
      return null;
    }
  }

  async updateVideoPrivacy(videoId: string): Promise<boolean> {
    try {
      const token = await this.getAccessToken();
      
      // First check current privacy settings
      const checkResponse = await fetch(`https://api.vimeo.com/videos/${videoId}`, {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Accept": "application/vnd.vimeo.*+json;version=3.4",
        },
      });
      
      if (checkResponse.ok) {
        const videoData = await checkResponse.json();
        console.log(`[Vimeo] Current privacy for ${videoId}: view=${videoData.privacy?.view}, embed=${videoData.privacy?.embed}`);
      }
      
      // Set view to "unlisted" and embed to "public"
      // Unlisted = accessible via link but not searchable on Vimeo
      // Public = embeddable anywhere
      const response = await fetch(`https://api.vimeo.com/videos/${videoId}`, {
        method: "PATCH",
        headers: {
          "Authorization": `Bearer ${token}`,
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
        const errorText = await response.text();
        console.error(`[Vimeo] Failed to update privacy for ${videoId}: ${response.status} - ${errorText}`);
        return false;
      }

      // Verify the change
      const verifyResponse = await fetch(`https://api.vimeo.com/videos/${videoId}`, {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Accept": "application/vnd.vimeo.*+json;version=3.4",
        },
      });
      
      if (verifyResponse.ok) {
        const updatedData = await verifyResponse.json();
        console.log(`[Vimeo] After update for ${videoId}: view=${updatedData.privacy?.view}, embed=${updatedData.privacy?.embed}`);
      }

      console.log(`[Vimeo] Updated privacy for video ${videoId} to unlisted + whitelist embed`);
      return true;
    } catch (error) {
      console.error(`[Vimeo] Error updating privacy for ${videoId}:`, error);
      return false;
    }
  }

  // Update video metadata on Vimeo (title, description)
  async updateVideoMetadata(videoId: string, metadata: { name?: string; description?: string }): Promise<boolean> {
    try {
      const token = await this.getAccessToken();
      const response = await this.fetchWithRetry(`https://api.vimeo.com/videos/${videoId}`, {
        method: "PATCH",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
          "Accept": "application/vnd.vimeo.*+json;version=3.4",
        },
        body: JSON.stringify(metadata),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`[Vimeo] Failed to update metadata for ${videoId}: ${response.status} - ${errorText}`);
        return false;
      }

      console.log(`[Vimeo] Updated metadata for video ${videoId}`);
      return true;
    } catch (error) {
      console.error(`[Vimeo] Error updating metadata for ${videoId}:`, error);
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
      const video = await this.getVideo(videoId);
      
      console.log(`[Vimeo] Video ${videoId} privacy: view=${video?.privacy?.view}, embed=${video?.privacy?.embed}`);
      
      // Method 1: Use player_embed_url if available (includes hash)
      if (video?.player_embed_url) {
        const url = new URL(video.player_embed_url);
        url.searchParams.set('dnt', '1');
        url.searchParams.set('title', '0');
        url.searchParams.set('byline', '0');
        url.searchParams.set('portrait', '0');
        console.log(`[Vimeo] Using player_embed_url: ${url.toString()}`);
        return url.toString();
      }
      
      // Method 2: Extract hash from embed.html if available
      if (video?.embed?.html) {
        const embedHtml = video.embed.html;
        const srcMatch = embedHtml.match(/src="([^"]+)"/);
        if (srcMatch && srcMatch[1]) {
          const url = new URL(srcMatch[1]);
          url.searchParams.set('dnt', '1');
          url.searchParams.set('title', '0');
          url.searchParams.set('byline', '0');
          url.searchParams.set('portrait', '0');
          console.log(`[Vimeo] Extracted from embed.html: ${url.toString()}`);
          return url.toString();
        }
      }
      
      // Method 3: Extract hash from video link (format: vimeo.com/videoId/hash)
      if (video?.link) {
        const linkMatch = video.link.match(/vimeo\.com\/\d+\/([a-zA-Z0-9]+)/);
        if (linkMatch && linkMatch[1]) {
          const hash = linkMatch[1];
          const embedUrl = `https://player.vimeo.com/video/${videoId}?h=${hash}&dnt=1&title=0&byline=0&portrait=0`;
          console.log(`[Vimeo] Extracted hash from link: ${embedUrl}`);
          return embedUrl;
        }
      }
      
      // Fallback: simple URL (may not work for unlisted videos)
      console.log(`[Vimeo] Falling back to simple URL for ${videoId} (no hash found)`);
      return `https://player.vimeo.com/video/${videoId}?dnt=1&title=0&byline=0&portrait=0`;
    } catch (error) {
      console.error(`[Vimeo] Error getting embed URL for ${videoId}:`, error);
      return `https://player.vimeo.com/video/${videoId}?dnt=1&title=0&byline=0&portrait=0`;
    }
  }

  // Upload a custom thumbnail to Vimeo
  async uploadThumbnail(videoId: string, imageBuffer: Buffer, contentType: string = "image/jpeg"): Promise<boolean> {
    try {
      const token = await this.getAccessToken();
      
      // Step 1: Create a picture resource to get upload link
      const createResponse = await this.fetchWithRetry(`https://api.vimeo.com/videos/${videoId}/pictures`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
          "Accept": "application/vnd.vimeo.*+json;version=3.4",
        },
        body: JSON.stringify({
          active: true,
        }),
      });

      if (!createResponse.ok) {
        const errorText = await createResponse.text();
        console.error(`[Vimeo] Failed to create picture resource for ${videoId}: ${createResponse.status} - ${errorText}`);
        return false;
      }

      const pictureData = await createResponse.json();
      const pictureUri = pictureData.uri;

      console.log(`[Vimeo] Picture resource response:`, JSON.stringify(pictureData, null, 2));

      // Vimeo should return upload_link for custom image upload
      // If not present, the API may not support custom thumbnails for this account type
      if (!pictureData.upload_link) {
        console.error(`[Vimeo] No upload_link returned for picture on ${videoId}. Response: ${JSON.stringify(pictureData)}`);
        console.log(`[Vimeo] Custom thumbnail upload may not be available for this account or video`);
        return false;
      }
      
      const uploadLink = pictureData.upload_link;

      console.log(`[Vimeo] Uploading thumbnail to ${uploadLink}`);

      // Step 2: Upload the image to the upload link
      const uploadResponse = await fetch(uploadLink, {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": contentType,
          "Accept": "application/vnd.vimeo.*+json;version=3.4",
        },
        body: imageBuffer,
      });

      if (!uploadResponse.ok) {
        const errorText = await uploadResponse.text();
        console.error(`[Vimeo] Failed to upload thumbnail for ${videoId}: ${uploadResponse.status} - ${errorText}`);
        return false;
      }

      // Step 3: Set the thumbnail as active
      if (pictureUri) {
        const activateResponse = await this.fetchWithRetry(`https://api.vimeo.com${pictureUri}`, {
          method: "PATCH",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
            "Accept": "application/vnd.vimeo.*+json;version=3.4",
          },
          body: JSON.stringify({ active: true }),
        });
        
        if (!activateResponse.ok) {
          console.log(`[Vimeo] Warning: Could not activate thumbnail for ${videoId}, but upload succeeded`);
        }
      }

      console.log(`[Vimeo] Successfully uploaded and activated thumbnail for video ${videoId}`);
      return true;
    } catch (error) {
      console.error(`[Vimeo] Error uploading thumbnail for ${videoId}:`, error);
      return false;
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

  // Get embed URL for playback without API calls (avoids rate limiting)
  // This is the most reliable way for video playback
  getEmbedUrl(videoId: string, hash?: string): string {
    // If we have a hash for unlisted videos, include it
    if (hash) {
      return `https://player.vimeo.com/video/${videoId}?h=${hash}&autoplay=1&title=0&byline=0&portrait=0`;
    }
    return `https://player.vimeo.com/video/${videoId}?autoplay=1&title=0&byline=0&portrait=0`;
  }

  // Get authenticated playback URL for private videos
  // Returns HLS or progressive download URL with signed token
  async getAuthenticatedPlaybackUrl(videoId: string): Promise<{ type: 'hls' | 'progressive' | 'embed'; url: string } | null> {
    try {
      // Priority 0: Try direct download API first (most reliable for audio extraction)
      console.log(`[Vimeo] Attempting direct download API for ${videoId}`);
      const downloadLink = await this.getDownloadLink(videoId);
      if (downloadLink) {
        console.log(`[Vimeo] Using direct download link (${downloadLink.quality}) for ${videoId}`);
        return { type: 'progressive', url: downloadLink.url };
      }
      
      // Use the download token (master API key) for full access to files
      const token = this.getDownloadToken();
      
      // Request video with files included
      const response = await this.fetchWithRetry(`https://api.vimeo.com/videos/${videoId}?fields=uri,name,status,privacy,files,play,player_embed_url,link,embed`, {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Accept": "application/vnd.vimeo.*+json;version=3.4",
        },
      });

      if (!response.ok) {
        console.error(`[Vimeo] Failed to get video ${videoId}: ${response.status}`);
        return null;
      }

      const video: VimeoVideo = await response.json();
      
      console.log(`[Vimeo] Video ${videoId} privacy: ${video.privacy?.view}, embed: ${video.privacy?.embed}`);
      console.log(`[Vimeo] Video ${videoId} has files: ${!!video.files}, has play: ${!!video.play}`);
      
      // Priority 1: HLS streaming (best for adaptive quality)
      if (video.play?.hls?.link) {
        console.log(`[Vimeo] Using HLS playback for ${videoId}`);
        return { type: 'hls', url: video.play.hls.link };
      }
      
      // Priority 2: Progressive files (direct download links)
      if (video.files && video.files.length > 0) {
        // Sort by quality (highest first) and pick the best one
        const sortedFiles = video.files
          .filter(f => f.type === 'video/mp4')
          .sort((a, b) => b.height - a.height);
        
        if (sortedFiles.length > 0) {
          const bestFile = sortedFiles[0];
          console.log(`[Vimeo] Using progressive ${bestFile.quality} for ${videoId}`);
          return { type: 'progressive', url: bestFile.link };
        }
      }
      
      // Priority 3: Progressive from play object
      if (video.play?.progressive && video.play.progressive.length > 0) {
        const sortedFiles = video.play.progressive.sort((a, b) => b.height - a.height);
        const bestFile = sortedFiles[0];
        console.log(`[Vimeo] Using progressive from play object ${bestFile.quality} for ${videoId}`);
        return { type: 'progressive', url: bestFile.link };
      }
      
      // Priority 4: Try fetching HLS from player config (works for embed-only videos)
      console.log(`[Vimeo] Attempting player config fallback for ${videoId}`);
      const playerConfig = await this.getPlayerConfig(videoId, video.link);
      if (playerConfig?.hls) {
        console.log(`[Vimeo] Using HLS from player config for ${videoId}`);
        return { type: 'hls', url: playerConfig.hls };
      }
      
      // Priority 5: Try scraping the embed page directly
      console.log(`[Vimeo] Attempting embed page scraping for ${videoId}`);
      const embedStream = await this.getStreamFromEmbedPage(videoId);
      if (embedStream) {
        console.log(`[Vimeo] Using ${embedStream.type} from embed page for ${videoId}`);
        return embedStream;
      }
      
      // Priority 6: Fallback to embed URL (can't be used for audio extraction)
      if (video.player_embed_url) {
        console.log(`[Vimeo] Falling back to embed URL for ${videoId} (not usable for audio extraction)`);
        return { type: 'embed', url: video.player_embed_url };
      }
      
      console.log(`[Vimeo] No playback method available for ${videoId}`);
      return null;
    } catch (error) {
      console.error(`[Vimeo] Error getting playback URL for ${videoId}:`, error);
      return null;
    }
  }

  // Fetch player config to get HLS stream for embed-only videos
  private async getPlayerConfig(videoId: string, videoLink?: string): Promise<{ hls: string } | null> {
    try {
      // Extract hash from video link if available (for unlisted/private videos)
      let hash = "";
      if (videoLink) {
        const hashMatch = videoLink.match(/vimeo\.com\/\d+\/([a-zA-Z0-9]+)/);
        if (hashMatch && hashMatch[1]) {
          hash = hashMatch[1];
        }
      }
      
      // Try multiple referrer options for domain-restricted videos
      const referrers = [
        "https://player.vimeo.com/",
        "https://vimeo.com/",
        process.env.REPLIT_DEPLOYMENT_URL || "https://onetimeonetime.replit.app/",
      ];
      
      for (const referer of referrers) {
        // Try fetching the player config
        const configUrl = hash 
          ? `https://player.vimeo.com/video/${videoId}/config?h=${hash}`
          : `https://player.vimeo.com/video/${videoId}/config`;
        
        console.log(`[Vimeo] Fetching player config: ${configUrl} with referer: ${referer}`);
        
        const response = await fetch(configUrl, {
          headers: {
            "Accept": "application/json",
            "Referer": referer,
            "Origin": referer.replace(/\/$/, ""),
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
          },
        });
        
        if (!response.ok) {
          console.log(`[Vimeo] Player config not available with referer ${referer}: ${response.status}`);
          continue;
        }
        
        const config = await response.json() as any;
        
        // The HLS URL is in request.files.hls.cdns
        const hlsCdns = config?.request?.files?.hls?.cdns;
        if (hlsCdns) {
          // Get first available CDN's URL
          const cdnKeys = Object.keys(hlsCdns);
          for (const cdn of cdnKeys) {
            const hlsUrl = hlsCdns[cdn]?.url;
            if (hlsUrl) {
              console.log(`[Vimeo] Found HLS URL in player config (${cdn}) with referer: ${referer}`);
              return { hls: hlsUrl };
            }
          }
        }
        
        // Alternative: check for progressive files
        const progressive = config?.request?.files?.progressive;
        if (progressive && progressive.length > 0) {
          const sorted = progressive.sort((a: any, b: any) => (b.height || 0) - (a.height || 0));
          if (sorted[0]?.url) {
            console.log(`[Vimeo] Found progressive URL in player config with referer: ${referer}`);
            return { hls: sorted[0].url }; // Return as "hls" for compatibility
          }
        }
      }
      
      console.log(`[Vimeo] No HLS/progressive URL found in player config with any referer`);
      return null;
    } catch (error) {
      console.error(`[Vimeo] Error fetching player config:`, error);
      return null;
    }
  }

  // Extract video stream from embed page HTML (fallback for heavily restricted videos)
  async getStreamFromEmbedPage(videoId: string): Promise<{ type: 'hls' | 'progressive', url: string } | null> {
    try {
      // Fetch the embed page
      const embedUrl = `https://player.vimeo.com/video/${videoId}`;
      console.log(`[Vimeo] Fetching embed page: ${embedUrl}`);
      
      const response = await fetch(embedUrl, {
        headers: {
          "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
          "Accept-Language": "en-US,en;q=0.5",
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          "Sec-Fetch-Dest": "document",
          "Sec-Fetch-Mode": "navigate",
        },
      });
      
      if (!response.ok) {
        console.log(`[Vimeo] Embed page not available: ${response.status}`);
        return null;
      }
      
      const html = await response.text();
      
      // Look for the config JSON embedded in the page
      // Pattern 1: window.playerConfig = {...}
      const configMatch = html.match(/window\.playerConfig\s*=\s*(\{[\s\S]*?\});/);
      if (configMatch) {
        try {
          const config = JSON.parse(configMatch[1]);
          const hlsCdns = config?.request?.files?.hls?.cdns;
          if (hlsCdns) {
            const cdnKeys = Object.keys(hlsCdns);
            for (const cdn of cdnKeys) {
              if (hlsCdns[cdn]?.url) {
                console.log(`[Vimeo] Found HLS URL in embed page config (${cdn})`);
                return { type: 'hls', url: hlsCdns[cdn].url };
              }
            }
          }
          const progressive = config?.request?.files?.progressive;
          if (progressive && progressive.length > 0) {
            const sorted = progressive.sort((a: any, b: any) => (b.height || 0) - (a.height || 0));
            if (sorted[0]?.url) {
              console.log(`[Vimeo] Found progressive URL in embed page config`);
              return { type: 'progressive', url: sorted[0].url };
            }
          }
        } catch (e) {
          console.log(`[Vimeo] Failed to parse playerConfig from embed page`);
        }
      }
      
      // Pattern 2: Look for master.json URL directly in the page
      const masterMatch = html.match(/(https:\/\/[^"'\s]+master\.json[^"'\s]*)/);
      if (masterMatch) {
        console.log(`[Vimeo] Found master.json URL in embed page`);
        // Master.json contains HLS/DASH manifests
        try {
          const masterResponse = await fetch(masterMatch[1], {
            headers: {
              "Accept": "application/json",
              "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
            },
          });
          if (masterResponse.ok) {
            const masterData = await masterResponse.json() as any;
            // Look for video URLs in master.json
            if (masterData.video && masterData.video.length > 0) {
              const sortedVideos = masterData.video.sort((a: any, b: any) => (b.height || 0) - (a.height || 0));
              const baseUrl = masterData.base_url || masterMatch[1].replace(/master\.json.*/, '');
              if (sortedVideos[0]?.base_url) {
                const videoUrl = baseUrl + sortedVideos[0].base_url + 'segment-0.m4s';
                console.log(`[Vimeo] Found video segment URL from master.json`);
                return { type: 'progressive', url: videoUrl };
              }
            }
          }
        } catch (e) {
          console.log(`[Vimeo] Failed to fetch master.json`);
        }
      }
      
      // Pattern 3: Look for .m3u8 playlist URL directly
      const m3u8Match = html.match(/(https:\/\/[^"'\s]+\.m3u8[^"'\s]*)/);
      if (m3u8Match) {
        console.log(`[Vimeo] Found m3u8 URL in embed page`);
        return { type: 'hls', url: m3u8Match[1] };
      }
      
      // Pattern 4: Look for progressive .mp4 URL
      const mp4Match = html.match(/(https:\/\/[^"'\s]+\.mp4[^"'\s]*)/);
      if (mp4Match && !mp4Match[1].includes('thumbnail') && !mp4Match[1].includes('poster')) {
        console.log(`[Vimeo] Found mp4 URL in embed page`);
        return { type: 'progressive', url: mp4Match[1] };
      }
      
      console.log(`[Vimeo] No stream URL found in embed page`);
      return null;
    } catch (error) {
      console.error(`[Vimeo] Error fetching embed page:`, error);
      return null;
    }
  }

  extractVideoId(uri: string): string {
    return uri.replace("/videos/", "");
  }
}

export const vimeoService = new VimeoService();
export { VimeoVideo, VimeoCreateResponse };
