import { AIProvider, AIProviderResult, AICheckStatusResult } from './ai-provider.interface';
import { Logger } from '@nestjs/common';
const Replicate = require('replicate');

export class ReplicateProvider implements AIProvider {
  private readonly logger = new Logger(ReplicateProvider.name);
  private replicate: any;

  constructor() {
    this.replicate = new Replicate({
      auth: process.env.REPLICATE_API_TOKEN,
    });
  }

  async generateImage(prompt: string, model: string): Promise<AIProviderResult> {
    this.logger.log(`Replicate: Generating EXACT image for prompt: "${prompt}" using black-forest-labs/flux-1.1-pro`);
    
    // Enhance prompt for exact photorealism
    const enhancedPrompt = `Photorealistic, 8k resolution, highly detailed, exact photograph of: ${prompt}. Cinematic lighting.`;
    
    try {
      const output = await this.replicate.run(
        "black-forest-labs/flux-1.1-pro",
        {
          input: {
            prompt: enhancedPrompt,
            aspect_ratio: "16:9",
            output_format: "jpg",
            output_quality: 90,
            safety_tolerance: 5 // maximize likeness
          }
        }
      );
      
      const mediaUrl = Array.isArray(output) ? output[0] : output;
      // Convert stream to string if needed
      return {
        providerJobId: `replicate-img-${Date.now()}`,
        status: 'COMPLETED',
        mediaUrl: mediaUrl.url ? mediaUrl.url() : String(mediaUrl)
      };
    } catch (e) {
      this.logger.error("Replicate API error:", e);
      throw e;
    }
  }

  async generateVideo(prompt: string, model: string): Promise<AIProviderResult> {
    this.logger.log(`Replicate: Generating GIF/Video via Replicate for prompt: "${prompt}"`);
    return this.createZoomPanVideo(prompt, 10, 'video');
  }

  async generateGif(prompt: string, model: string): Promise<AIProviderResult> {
    this.logger.log(`Replicate: Generating GIF via Replicate for prompt: "${prompt}"`);
    return this.createZoomPanVideo(prompt, 3, 'gif');
  }

  private async createZoomPanVideo(prompt: string, durationSeconds: number, type: string): Promise<AIProviderResult> {
    const fs = require('fs');
    const path = require('path');
    const ffmpeg = require('fluent-ffmpeg');
    const ffmpegInstaller = require('@ffmpeg-installer/ffmpeg');
    ffmpeg.setFfmpegPath(ffmpegInstaller.path);

    const outputFileName = `${type}-${Date.now()}.mp4`;
    const tempImageName = `temp-${Date.now()}.jpg`;
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    const outputPath = path.join(uploadsDir, outputFileName);
    const tempImagePath = path.join(uploadsDir, tempImageName);
    
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    try {
      this.logger.log(`1. Generating highly accurate Image from Replicate...`);
      const imgRes = await this.generateImage(prompt, '');
      const imageUrl = imgRes.mediaUrl as string;
      
      const res = await globalThis.fetch(imageUrl);
      const arrayBuffer = await res.arrayBuffer();
      fs.writeFileSync(tempImagePath, Buffer.from(arrayBuffer));

      this.logger.log(`2. Animating Image with smooth Zoom/Pan (Glitch-free)...`);
      
      await new Promise((resolve, reject) => {
        ffmpeg(tempImagePath)
          .loop(durationSeconds)
          .videoFilters([
            `zoompan=z='min(zoom+0.0015,1.5)':d=${durationSeconds * 30}:x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)'`,
            'framerate=30'
          ])
          .outputOptions([
            '-c:v', 'libx264',
            '-t', durationSeconds.toString(),
            '-pix_fmt', 'yuv420p',
            '-y'
          ])
          .save(outputPath)
          .on('end', resolve)
          .on('error', (err: any) => {
            this.logger.error('FFmpeg error:', err);
            reject(err);
          });
      });

      if (fs.existsSync(tempImagePath)) {
        fs.unlinkSync(tempImagePath);
      }

      const port = process.env.PORT || '3000';
      const mediaUrl = `http://localhost:${port}/public/uploads/${outputFileName}`;
      
      return {
        providerJobId: `replicate-${type}-${Date.now()}`,
        status: 'COMPLETED',
        mediaUrl
      };
    } catch (e) {
      this.logger.error(`Error generating AI ${type}`, e);
      throw e;
    }
  }

  async checkStatus(providerJobId: string): Promise<AICheckStatusResult> {
    return {
      providerJobId,
      status: 'COMPLETED',
    };
  }
}
