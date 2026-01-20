import { db } from "../server/db";
import { videos } from "../shared/schema";
import { isNotNull } from "drizzle-orm";

const VIMEO_ACCESS_TOKEN = process.env.VIMEO_ACCESS_TOKEN;
const ALLOWED_DOMAINS = [
  "onetimeonetime.com",
  "www.onetimeonetime.com",
  "workspace.moshehoffman37.repl.co",
  "moshehoffman37-workspace.replit.dev",
  "workspace-moshehoffman37.replit.app",
  "5adb8632-36cc-47e1-9d7b-6ec0f00a6ba6-00-2pf0xxjmxwfrr.worf.replit.dev",
];

async function setDomainWhitelist(videoId: string, domains: string[]): Promise<boolean> {
  try {
    // Set embed privacy to whitelist
    const response = await fetch(`https://api.vimeo.com/videos/${videoId}`, {
      method: "PATCH",
      headers: {
        "Authorization": `Bearer ${VIMEO_ACCESS_TOKEN}`,
        "Content-Type": "application/json",
        "Accept": "application/vnd.vimeo.*+json;version=3.4",
      },
      body: JSON.stringify({
        privacy: {
          embed: "whitelist",
          view: "disable",
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`  Failed to set embed privacy: ${errorText}`);
      return false;
    }

    // Add each domain to whitelist
    for (const domain of domains) {
      const domainResponse = await fetch(
        `https://api.vimeo.com/videos/${videoId}/privacy/domains/${domain}`,
        {
          method: "PUT",
          headers: {
            "Authorization": `Bearer ${VIMEO_ACCESS_TOKEN}`,
          },
        }
      );
      
      if (!domainResponse.ok) {
        console.error(`  Failed to add domain ${domain}`);
      }
    }

    return true;
  } catch (error) {
    console.error(`Error setting domain whitelist for ${videoId}:`, error);
    return false;
  }
}

async function main() {
  if (!VIMEO_ACCESS_TOKEN) {
    console.error("VIMEO_ACCESS_TOKEN is not set");
    process.exit(1);
  }

  console.log("Fetching videos with Vimeo IDs...");
  const vimeoVideos = await db
    .select({ id: videos.id, title: videos.title, vimeoVideoId: videos.vimeoVideoId })
    .from(videos)
    .where(isNotNull(videos.vimeoVideoId));

  console.log(`Found ${vimeoVideos.length} videos with Vimeo IDs\n`);

  let success = 0;
  let failed = 0;

  for (const video of vimeoVideos) {
    console.log(`Processing: ${video.title} (${video.vimeoVideoId})`);
    
    const result = await setDomainWhitelist(video.vimeoVideoId!, ALLOWED_DOMAINS);
    
    if (result) {
      console.log(`  ✓ Domain whitelist set`);
      success++;
    } else {
      console.log(`  ✗ Failed to set domain whitelist`);
      failed++;
    }

    // Rate limiting
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  console.log("\n=== Summary ===");
  console.log(`Success: ${success}`);
  console.log(`Failed: ${failed}`);
  console.log(`\nAllowed domains: ${ALLOWED_DOMAINS.join(", ")}`);
}

main().catch(console.error);
