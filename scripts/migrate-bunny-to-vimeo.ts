import { db } from "../server/db";
import { videos } from "../shared/schema";
import { eq, isNotNull } from "drizzle-orm";

const VIMEO_ACCESS_TOKEN = process.env.VIMEO_ACCESS_TOKEN;
const BUNNY_CDN_HOSTNAME = process.env.BUNNY_CDN_HOSTNAME || "vz-2480b6a7-327";

interface VimeoUploadResponse {
  uri: string;
  name: string;
  link: string;
  status: string;
}

async function createVimeoPullUpload(videoUrl: string, title: string, description?: string): Promise<VimeoUploadResponse | null> {
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
        description: description || "",
        privacy: {
          view: "unlisted",
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Vimeo API error: ${response.status} - ${errorText}`);
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error("Error creating Vimeo upload:", error);
    return null;
  }
}

async function getBunnyVideoUrl(bunnyGuid: string): string {
  return `https://${BUNNY_CDN_HOSTNAME}.b-cdn.net/${bunnyGuid}/play_720p.mp4`;
}

async function migrateVideos() {
  if (!VIMEO_ACCESS_TOKEN) {
    console.error("VIMEO_ACCESS_TOKEN is not set");
    process.exit(1);
  }

  console.log("Starting Bunny to Vimeo migration...\n");

  const bunnyVideos = await db
    .select()
    .from(videos)
    .where(isNotNull(videos.bunnyGuid));

  console.log(`Found ${bunnyVideos.length} Bunny videos to migrate\n`);

  const results = {
    success: [] as string[],
    failed: [] as string[],
  };

  for (const video of bunnyVideos) {
    if (!video.bunnyGuid) continue;

    console.log(`Processing: ${video.title}`);
    
    const bunnyUrl = await getBunnyVideoUrl(video.bunnyGuid);
    console.log(`  Bunny URL: ${bunnyUrl}`);

    const vimeoResult = await createVimeoPullUpload(
      bunnyUrl,
      video.title,
      video.description || undefined
    );

    if (vimeoResult) {
      console.log(`  ✓ Submitted to Vimeo: ${vimeoResult.link}`);
      console.log(`  Vimeo ID: ${vimeoResult.uri}`);
      results.success.push(video.title);
    } else {
      console.log(`  ✗ Failed to submit to Vimeo`);
      results.failed.push(video.title);
    }

    console.log("");
    
    // Rate limiting - wait 1 second between requests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  console.log("\n=== Migration Summary ===");
  console.log(`Successful: ${results.success.length}`);
  console.log(`Failed: ${results.failed.length}`);
  
  if (results.failed.length > 0) {
    console.log("\nFailed videos:");
    results.failed.forEach(title => console.log(`  - ${title}`));
  }

  console.log("\nNote: Vimeo will process these videos in the background.");
  console.log("Check your Vimeo library for transcoding progress.");
}

migrateVideos().catch(console.error);
