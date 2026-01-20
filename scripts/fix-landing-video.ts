const VIMEO_ACCESS_TOKEN = process.env.VIMEO_ACCESS_TOKEN;

const LANDING_VIDEO_IDS = [
  "1143589086", // Background video
  "1138747998", // Featured video 1
  "1050076957", // Featured video 2
  "1138749816", // Featured video 3
];

const ALLOWED_DOMAINS = [
  "onetimeonetime.com",
  "www.onetimeonetime.com",
  "workspace.moshehoffman37.repl.co",
  "moshehoffman37-workspace.replit.dev",
];

async function checkAndFixVideo(videoId: string) {
  console.log(`\nChecking video ${videoId}...`);
  
  const checkRes = await fetch(`https://api.vimeo.com/videos/${videoId}`, {
    headers: {
      "Authorization": `Bearer ${VIMEO_ACCESS_TOKEN}`,
      "Accept": "application/vnd.vimeo.*+json;version=3.4",
    },
  });
  
  if (!checkRes.ok) {
    console.log(`  Video not accessible: ${checkRes.status}`);
    return;
  }
  
  const video = await checkRes.json();
  console.log(`  Name: ${video.name}`);
  console.log(`  Privacy view: ${video.privacy?.view}`);
  console.log(`  Privacy embed: ${video.privacy?.embed}`);

  // If embed is set to whitelist, add our domains
  if (video.privacy?.embed === "whitelist") {
    console.log("  Adding domains to whitelist...");
    for (const domain of ALLOWED_DOMAINS) {
      const res = await fetch(
        `https://api.vimeo.com/videos/${videoId}/privacy/domains/${domain}`,
        {
          method: "PUT",
          headers: { "Authorization": `Bearer ${VIMEO_ACCESS_TOKEN}` },
        }
      );
      console.log(`    ${domain}: ${res.ok ? "OK" : "Failed"}`);
    }
  } else if (video.privacy?.embed === "private") {
    console.log("  Video is private - changing to whitelist...");
    const patchRes = await fetch(`https://api.vimeo.com/videos/${videoId}`, {
      method: "PATCH",
      headers: {
        "Authorization": `Bearer ${VIMEO_ACCESS_TOKEN}`,
        "Content-Type": "application/json",
        "Accept": "application/vnd.vimeo.*+json;version=3.4",
      },
      body: JSON.stringify({
        privacy: {
          embed: "whitelist",
        },
      }),
    });
    console.log(`  Set to whitelist: ${patchRes.ok ? "OK" : "Failed"}`);
    
    if (patchRes.ok) {
      for (const domain of ALLOWED_DOMAINS) {
        const res = await fetch(
          `https://api.vimeo.com/videos/${videoId}/privacy/domains/${domain}`,
          {
            method: "PUT",
            headers: { "Authorization": `Bearer ${VIMEO_ACCESS_TOKEN}` },
          }
        );
        console.log(`    ${domain}: ${res.ok ? "OK" : "Failed"}`);
      }
    }
  } else {
    console.log("  Embed is public/unlisted - should work everywhere");
  }
}

async function main() {
  if (!VIMEO_ACCESS_TOKEN) {
    console.error("VIMEO_ACCESS_TOKEN is not set");
    process.exit(1);
  }

  console.log("Checking landing page videos...");
  
  for (const videoId of LANDING_VIDEO_IDS) {
    await checkAndFixVideo(videoId);
  }
  
  console.log("\nDone!");
}

main().catch(console.error);
