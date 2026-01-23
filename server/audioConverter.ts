import { spawn } from "child_process";
import * as fs from "fs";
import * as path from "path";

export interface ConversionResult {
  success: boolean;
  outputPath?: string;
  duration?: number;
  fileSize?: number;
  error?: string;
  skipped?: boolean;
}

// Check if file is already MP3 with approximately 64kbps bitrate
async function isAlreadyMp3_64kbps(filePath: string): Promise<boolean> {
  return new Promise((resolve) => {
    const ffprobe = spawn("ffprobe", [
      "-v", "error",
      "-select_streams", "a:0",
      "-show_entries", "stream=codec_name,bit_rate",
      "-of", "json",
      filePath
    ]);

    let output = "";
    ffprobe.stdout.on("data", (data) => {
      output += data.toString();
    });

    ffprobe.on("close", (code) => {
      if (code !== 0) {
        resolve(false);
        return;
      }
      
      try {
        const data = JSON.parse(output);
        const stream = data.streams?.[0];
        if (!stream) {
          resolve(false);
          return;
        }
        
        const codec = stream.codec_name?.toLowerCase();
        const bitrate = parseInt(stream.bit_rate || "0", 10);
        
        // Check if MP3 and bitrate is between 56k and 72k (allowing some tolerance around 64k)
        const isMp3 = codec === "mp3";
        const isApprox64k = bitrate >= 56000 && bitrate <= 72000;
        
        console.log(`[AudioConverter] File info: codec=${codec}, bitrate=${bitrate}bps`);
        
        if (isMp3 && isApprox64k) {
          console.log("[AudioConverter] File is already MP3 ~64kbps, skipping conversion");
          resolve(true);
        } else {
          resolve(false);
        }
      } catch (e) {
        resolve(false);
      }
    });

    ffprobe.on("error", () => {
      resolve(false);
    });
  });
}

export async function convertToMp3(
  inputPath: string,
  outputDir: string,
  outputFilename: string
): Promise<ConversionResult> {
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  const outputPath = path.join(outputDir, outputFilename);
  
  // Check if already MP3 64kbps - just move the file instead of converting
  const alreadyOptimal = await isAlreadyMp3_64kbps(inputPath);
  if (alreadyOptimal) {
    try {
      // Just move/copy the file to output location
      fs.copyFileSync(inputPath, outputPath);
      fs.unlinkSync(inputPath);
      
      const stats = fs.statSync(outputPath);
      const duration = await getAudioDuration(outputPath);
      
      console.log("[AudioConverter] Skipped conversion, file already optimal:", outputPath);
      
      return {
        success: true,
        outputPath,
        duration,
        fileSize: stats.size,
        skipped: true
      };
    } catch (err) {
      console.error("[AudioConverter] Error moving file:", err);
      // Fall through to conversion
    }
  }
  
  return new Promise((resolve) => {
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
