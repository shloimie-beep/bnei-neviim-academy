import { spawn } from "child_process";
import * as fs from "fs";
import * as path from "path";

export interface ConversionResult {
  success: boolean;
  outputPath?: string;
  duration?: number;
  fileSize?: number;
  error?: string;
}

export async function convertToMp3(
  inputPath: string,
  outputDir: string,
  outputFilename: string
): Promise<ConversionResult> {
  return new Promise((resolve) => {
    const outputPath = path.join(outputDir, outputFilename);
    
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const args = [
      "-i", inputPath,
      "-codec:a", "libmp3lame",
      "-b:a", "64k",
      "-ar", "44100",
      "-ac", "2",
      "-y",
      outputPath
    ];

    console.log("[AudioConverter] Converting to MP3 64kbps:", inputPath);
    
    const ffmpeg = spawn("ffmpeg", args);
    let stderr = "";

    ffmpeg.stderr.on("data", (data) => {
      stderr += data.toString();
    });

    ffmpeg.on("close", async (code) => {
      if (code !== 0) {
        console.error("[AudioConverter] Conversion failed:", stderr);
        resolve({ success: false, error: `FFmpeg exited with code ${code}` });
        return;
      }

      try {
        const stats = fs.statSync(outputPath);
        const duration = await getAudioDuration(outputPath);

        fs.unlinkSync(inputPath);
        console.log("[AudioConverter] Original file deleted:", inputPath);

        resolve({
          success: true,
          outputPath,
          duration,
          fileSize: stats.size
        });
      } catch (err) {
        console.error("[AudioConverter] Error getting file info:", err);
        resolve({ success: false, error: "Failed to get converted file info" });
      }
    });

    ffmpeg.on("error", (err) => {
      console.error("[AudioConverter] FFmpeg spawn error:", err);
      resolve({ success: false, error: err.message });
    });
  });
}

async function getAudioDuration(filePath: string): Promise<number> {
  return new Promise((resolve) => {
    const ffprobe = spawn("ffprobe", [
      "-v", "error",
      "-show_entries", "format=duration",
      "-of", "default=noprint_wrappers=1:nokey=1",
      filePath
    ]);

    let output = "";
    ffprobe.stdout.on("data", (data) => {
      output += data.toString();
    });

    ffprobe.on("close", () => {
      const duration = parseFloat(output.trim());
      resolve(isNaN(duration) ? 0 : Math.round(duration));
    });

    ffprobe.on("error", () => {
      resolve(0);
    });
  });
}
