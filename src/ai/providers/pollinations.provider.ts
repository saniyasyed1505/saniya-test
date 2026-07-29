import { AIProvider, AIProviderResult, AICheckStatusResult } from './ai-provider.interface';
import { Logger } from '@nestjs/common';

export class PollinationsProvider implements AIProvider {
  private readonly logger = new Logger(PollinationsProvider.name);

  async generateImage(prompt: string, model: string): Promise<AIProviderResult> {
    this.logger.log(`Pollinations: Generating image for prompt: "${prompt}" using ${model}`);
    
    // Fallback to flux if model not specified or if it's the old replicate model
    const targetModel = (model && model !== 'replicate-stable-diffusion') ? model : 'flux';
    const seed = Math.floor(Math.random() * 100000);
    const mediaUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?model=${targetModel}&seed=${seed}&nologo=true`;

    return {
      providerJobId: `pollinations-image-${Date.now()}`,
      status: 'COMPLETED', // Pollinations returns image directly via URL
      mediaUrl
    };
  }

  async generateVideo(prompt: string, model: string): Promise<AIProviderResult> {
    this.logger.log(`Generating TRUE AI Video (Free/Accurate/Slow) for prompt: "${prompt}"`);
    
    const fs = require('fs');
    const path = require('path');
    const fetch = require('node-fetch'); // Ensure node-fetch is available

    const outputFileName = `video-${Date.now()}.mp4`;
    const outputPath = path.join(process.cwd(), 'public', 'uploads', outputFileName);
    
    if (!fs.existsSync(path.dirname(outputPath))) {
      fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    }

    let videoUrl = ''; 
    let imageUrl = '';

    try {
      this.logger.log(`1. Generating Image from Pollinations...`);
      imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?nologo=true`;
      videoUrl = imageUrl; // Default fallback is the image
      
      const res = await (globalThis as any).fetch(imageUrl);
      const buffer = await res.arrayBuffer();
      const imageBlob = new Blob([buffer], { type: 'image/jpeg' });

      this.logger.log(`2. Animating Image with HuggingFace Stable Video Diffusion (This takes 2-4 minutes)...`);
      const { Client } = await eval(`import('@gradio/client')`); 
      const app = await Client.connect("multimodalart/stable-video-diffusion");
      
      const result = await app.predict("/video", [
        imageBlob,
        Math.floor(Math.random() * 100000), 
        true, 
        127, 
        6, 
      ]);
      
      if (result.data && result.data[0] && result.data[0].video && result.data[0].video.url) {
        videoUrl = result.data[0].video.url;
        this.logger.log(`HuggingFace Video Generated: ${videoUrl}`);
      }
    } catch (e) {
      this.logger.error('Error generating AI video from HuggingFace, using fallback stock video or image.', e);
      const stopWords = ['a', 'an', 'the', 'is', 'are', 'in', 'on', 'with', 'for', 'to', 'of'];
      let keywords = prompt.toLowerCase().split(/[\s,]+/).filter(w => !stopWords.includes(w) && w.length > 2).slice(0, 2).join('+');
      if (keywords) {
        try {
          const pixabayKey = process.env.PIXABAY_API_KEY;
          const res = await (globalThis as any).fetch(`https://pixabay.com/api/videos/?key=${pixabayKey}&q=${keywords}`);
          const data = await res.json();
          if (data.hits && data.hits.length > 0) {
            videoUrl = data.hits[0].videos.large.url || data.hits[0].videos.medium.url;
          }
        } catch (err) {}
      }
    }

    if (videoUrl === imageUrl) {
      // If we are just returning the image (no video), no need to FFmpeg it.
      return {
        providerJobId: `hf-video-img-${Date.now()}`,
        status: 'COMPLETED',
        mediaUrl: videoUrl
      };
    }

    this.logger.log(`3. Adding Music and Looping via FFmpeg...`);
    const audioUrl = "https://raw.githubusercontent.com/mdn/webaudio-examples/main/audio-analyser/viper.mp3";
    const ffmpeg = require('fluent-ffmpeg');
    const ffmpegInstaller = require('@ffmpeg-installer/ffmpeg');
    
    ffmpeg.setFfmpegPath(ffmpegInstaller.path);
    
    await new Promise((resolve, reject) => {
      ffmpeg()
        .addInput(videoUrl)
        .inputOptions(['-stream_loop', '-1']) // loop video
        .addInput(audioUrl)
        .inputOptions(['-stream_loop', '-1']) // loop audio
        .outputOptions([
          '-t', '20',             // exactly 20 seconds
          '-c:v', 'libx264',      // re-encode video to ensure clean loops and compatibility
          '-c:a', 'aac',          // encode audio
          '-map', '0:v:0',        // take video from first input
          '-map', '1:a:0',        // take audio from second input
          '-pix_fmt', 'yuv420p',  // ensure standard format
          '-y'                    // overwrite
        ])
        .save(outputPath)
        .on('end', resolve)
        .on('error', (err: any) => {
          this.logger.error('FFmpeg error:', err);
          reject(err);
        });
    });

    const port = process.env.PORT || '3000';
    let mediaUrl = `http://localhost:${port}/public/uploads/${outputFileName}`;
    
    return {
      providerJobId: `hf-video-${Date.now()}`,
      status: 'COMPLETED',
      mediaUrl
    };
  }

  async generateGif(prompt: string, model: string): Promise<AIProviderResult> {
    this.logger.log(`Generating GIF Video for prompt: "${prompt}"`);
    let videoUrl = '';
    let imageUrl = '';
    try {
      this.logger.log(`1. Generating Image from Pollinations for GIF...`);
      imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?nologo=true`;
      videoUrl = imageUrl;
      
      const res = await (globalThis as any).fetch(imageUrl);
      const buffer = await res.arrayBuffer();
      const imageBlob = new Blob([buffer], { type: 'image/jpeg' });

      this.logger.log(`2. Animating Image with HuggingFace Stable Video Diffusion...`);
      const { Client } = await eval(`import('@gradio/client')`); 
      const app = await Client.connect("multimodalart/stable-video-diffusion");
      const result = await app.predict("/video", [
        imageBlob,
        Math.floor(Math.random() * 100000), 
        true, 
        127, 
        6, 
      ]);
      if (result.data && result.data[0] && result.data[0].video && result.data[0].video.url) {
        videoUrl = result.data[0].video.url;
      }
    } catch (e) {
      this.logger.error('Error generating AI GIF from HuggingFace, using fallback image.', e);
    }
    
    return { providerJobId: `hf-gif-${Date.now()}`, status: 'COMPLETED', mediaUrl: videoUrl };
  }

  async checkStatus(providerJobId: string): Promise<AICheckStatusResult> {
    // Since we return COMPLETED directly, this is mostly a fallback.
    return {
      providerJobId,
      status: 'COMPLETED',
    };
  }
}
