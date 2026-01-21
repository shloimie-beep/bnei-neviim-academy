import { db } from "../server/db";
import { videos } from "../shared/schema";
import { eq, isNotNull } from "drizzle-orm";
import { vimeoService } from "../server/vimeoService";

async function syncThumbnails() {
  try {
    const videosToUpdate = await db.select()
      .from(videos)
      .where(isNotNull(videos.vimeoVideoId));
    
    console.log(`Found ${videosToUpdate.length} Vimeo videos`);
    
    let updated = 0;
    let skipped = 0;
    let errors = 0;
    
    for (const video of videosToUpdate) {
      try {
        if (video.thumbnailPath?.startsWith("https://i.vimeocdn.com")) {
          skipped++;
          continue;
        }
        
        const vimeoData = await vimeoService.getVideo(video.vimeoVideoId!);
        if (vimeoData?.pictures?.base_link) {
          let thumbnailUrl = vimeoData.pictures.base_link;
          if (!thumbnailUrl.includes("_")) {
            thumbnailUrl = thumbnailUrl.replace(/\?.*$/, "") + "_640x360";
          }
          await db.update(videos)
            .set({ thumbnailPath: thumbnailUrl })
            .where(eq(videos.id, video.id));
          updated++;
          console.log(`Updated: ${video.title}`);
        }
      } catch (err: any) {
        console.error(`Error for ${video.id}:`, err.message);
        errors++;
      }
    }
    
    console.log(`\nDone! Updated: ${updated}, Skipped: ${skipped}, Errors: ${errors}`);
    process.exit(0);
  } catch (err) {
    console.error("Error:", err);
    process.exit(1);
  }
}

syncThumbnails();
