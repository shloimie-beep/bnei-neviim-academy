import { db } from "../server/db";
import { videos } from "../shared/schema";
import { eq, isNull, isNotNull, and } from "drizzle-orm";

const VIMEO_ACCESS_TOKEN = process.env.VIMEO_ACCESS_TOKEN;
const BUNNY_CDN_HOSTNAME = process.env.BUNNY_CDN_HOSTNAME || "vz-2480b6a7-327";

interface VimeoVideo {
  uri: string;
  name: string;
  link: string;
  status: string;
}

async function getExistingVimeoVideos(): Promise<Map<string, string>> {
  const nameToId = new Map<string, string>();
  let page = 1;
  const perPage = 100;
  
  while (true) {
    const response = await fetch(
      `https://api.vimeo.com/me/videos?page=${page}&per_page=${perPage}&fields=uri,name`,
      {
        headers: {
          "Authorization": `Bearer ${VIMEO_ACCESS_TOKEN}`,
          "Accept": "application/vnd.vimeo.*+json;version=3.4",
        },
      }
    );
    
    if (!response.ok) break;
    
    const data = await response.json();
    const vids = data.data || [];
    
    for (const video of vids) {
      const vimeoId = video.uri.replace("/videos/", "");
      nameToId.set(video.name, vimeoId);
    }
    
    if (vids.length < perPage) break;
    page++;
  }
  
  return nameToId;
}

async function createVimeoPullUpload(videoUrl: string, title: string): Promise<string | null> {
  try {
    const response = await fetch("https://api.vimeo.com/me/videos", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${VIMEO_ACCESS_TOKEN}`,
        "Content-Type": "application/json",
        "Accept": "application/vnd.vimeo.*+json;version=3.4",
      },
      body: JSON.stringify({
        upload: {
          approach: "pull",
          link: videoUrl,
        },
        name: title,
        privacy: {
          view: "disable",
          embed: "whitelist",
        },
        embed: {
          buttons: {
            like: false,
            watchlater: false,
            share: false,
          },
          logos: {
            vimeo: false,
          },
          title: {
            name: "hide",
            owner: "hide",
            portrait: "hide",
          },
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Vimeo API error: ${response.status} - ${errorText}`);
      return null;
    }

    const result = await response.json();
    return result.uri.replace("/videos/", "");
  } catch (error) {
    console.error("Error creating Vimeo upload:", error);
    return null;
  }
}

function getBunnyVideoUrl(bunnyGuid: string): string {
  return `https://${BUNNY_CDN_HOSTNAME}.b-cdn.net/${bunnyGuid}/play_720p.mp4`;
}

async function syncVideos() {
  if (!VIMEO_ACCESS_TOKEN) {
    console.error("VIMEO_ACCESS_TOKEN is not set");
    process.exit(1);
  }

  console.log("Fetching videos from database that need Vimeo migration...");
  const videosToMigrate = await db
    .select()
    .from(videos)
    .where(
      and(
        isNotNull(videos.bunnyGuid),
        isNull(videos.vimeoVideoId),
        eq(videos.mediaType, "video")
      )
    );

  console.log(`Found ${videosToMigrate.length} videos needing migration\n`);

  if (videosToMigrate.length === 0) {
    console.log("No videos to migrate!");
    return;
  }

  console.log("Fetching existing Vimeo videos to check for matches...");
  const existingVimeoVideos = await getExistingVimeoVideos();
  console.log(`Found ${existingVimeoVideos.size} videos in Vimeo\n`);

  const results = {
    linked: 0,
    uploaded: 0,
    failed: 0,
  };

  for (const video of videosToMigrate) {
    console.log(`Processing: ${video.title}`);
    
    // Check if video already exists in Vimeo by title
    const existingVimeoId = existingVimeoVideos.get(video.title);
    
    if (existingVimeoId) {
      console.log(`  Found existing Vimeo video: ${existingVimeoId}`);
      await db
        .update(videos)
        .set({ vimeoVideoId: existingVimeoId })
        .where(eq(videos.id, video.id));
      console.log(`  ✓ Linked to database`);
      results.linked++;
    } else {
      // Need to upload to Vimeo
      const bunnyUrl = getBunnyVideoUrl(video.bunnyGuid!);
      console.log(`  Uploading from: ${bunnyUrl}`);
      
      const vimeoId = await createVimeoPullUpload(bunnyUrl, video.title);
      
      if (vimeoId) {
        await db
          .update(videos)
          .set({ vimeoVideoId: vimeoId })
          .where(eq(videos.id, video.id));
        console.log(`  ✓ Uploaded to Vimeo: ${vimeoId}`);
        results.uploaded++;
      } else {
        console.log(`  ✗ Failed to upload to Vimeo`);
        results.failed++;
      }
      
      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    console.log("");
  }

  console.log("\n=== Sync Summary ===");
  console.log(`Linked to existing Vimeo videos: ${results.linked}`);
  console.log(`Uploaded to Vimeo: ${results.uploaded}`);
  console.log(`Failed: ${results.failed}`);
  
  if (results.uploaded > 0) {
    console.log("\nNote: Vimeo will process uploaded videos in the background.");
  }
}

syncVideos().catch(console.error);
