const VIMEO_ACCESS_TOKEN = process.env.VIMEO_ACCESS_TOKEN;
const BUNNY_API_KEY = process.env.BUNNY_API_KEY;
const BUNNY_LIBRARY_ID = process.env.BUNNY_LIBRARY_ID;
const BUNNY_CDN_HOSTNAME = process.env.BUNNY_CDN_HOSTNAME || "vz-2480b6a7-327";

interface BunnyVideo {
  guid: string;
  title: string;
  status: number;
  length: number;
}

interface VimeoUploadResponse {
  uri: string;
  name: string;
  link: string;
  status: string;
}

async function fetchAllBunnyVideos(): Promise<BunnyVideo[]> {
  const allVideos: BunnyVideo[] = [];
  let page = 1;
  const itemsPerPage = 100;
  
  while (true) {
    const response = await fetch(
      `https://video.bunnycdn.com/library/${BUNNY_LIBRARY_ID}/videos?page=${page}&itemsPerPage=${itemsPerPage}`,
      {
        headers: {
          "AccessKey": BUNNY_API_KEY!,
        },
      }
    );
    
    if (!response.ok) {
      console.error(`Bunny API error: ${response.status}`);
      break;
    }
    
    const data = await response.json();
    const items = data.items || [];
    
    allVideos.push(...items);
    
    if (items.length < itemsPerPage) {
      break;
    }
    
    page++;
  }
  
  return allVideos;
}

async function getExistingVimeoVideoNames(): Promise<Set<string>> {
  const names = new Set<string>();
  let page = 1;
  const perPage = 100;
  
  while (true) {
    const response = await fetch(
      `https://api.vimeo.com/me/videos?page=${page}&per_page=${perPage}&fields=name`,
      {
        headers: {
          "Authorization": `Bearer ${VIMEO_ACCESS_TOKEN}`,
          "Accept": "application/vnd.vimeo.*+json;version=3.4",
        },
      }
    );
    
    if (!response.ok) break;
    
    const data = await response.json();
    const videos = data.data || [];
    
    for (const video of videos) {
      names.add(video.name);
    }
    
    if (videos.length < perPage) break;
    page++;
  }
  
  return names;
}

async function createVimeoPullUpload(videoUrl: string, title: string): Promise<VimeoUploadResponse | null> {
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

function getBunnyVideoUrl(bunnyGuid: string): string {
  return `https://${BUNNY_CDN_HOSTNAME}.b-cdn.net/${bunnyGuid}/play_720p.mp4`;
}

async function migrateVideos() {
  if (!VIMEO_ACCESS_TOKEN) {
    console.error("VIMEO_ACCESS_TOKEN is not set");
    process.exit(1);
  }
  
  if (!BUNNY_API_KEY || !BUNNY_LIBRARY_ID) {
    console.error("BUNNY_API_KEY or BUNNY_LIBRARY_ID is not set");
    process.exit(1);
  }

  console.log("Fetching all videos from Bunny library...");
  const bunnyVideos = await fetchAllBunnyVideos();
  console.log(`Found ${bunnyVideos.length} videos in Bunny\n`);
  
  console.log("Fetching existing Vimeo videos to skip duplicates...");
  const existingVimeoNames = await getExistingVimeoVideoNames();
  console.log(`Found ${existingVimeoNames.size} videos already in Vimeo\n`);

  const toMigrate = bunnyVideos.filter(v => !existingVimeoNames.has(v.title));
  console.log(`${toMigrate.length} videos need to be migrated\n`);

  const results = {
    success: [] as string[],
    failed: [] as string[],
    skipped: bunnyVideos.length - toMigrate.length,
  };

  for (const video of toMigrate) {
    console.log(`Processing: ${video.title}`);
    
    const bunnyUrl = getBunnyVideoUrl(video.guid);
    console.log(`  Bunny URL: ${bunnyUrl}`);

    const vimeoResult = await createVimeoPullUpload(bunnyUrl, video.title);

    if (vimeoResult) {
      console.log(`  ✓ Submitted to Vimeo: ${vimeoResult.link}`);
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
  console.log(`Skipped (already in Vimeo): ${results.skipped}`);
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
