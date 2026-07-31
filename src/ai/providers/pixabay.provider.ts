import { Logger } from '@nestjs/common';
import { AIProvider, AIProviderResult, AICheckStatusResult } from './ai-provider.interface';

export class PixabayProvider implements AIProvider {
  private readonly logger = new Logger(PixabayProvider.name);

  async generateImage(prompt: string, model: string): Promise<AIProviderResult> {
    this.logger.log(`Pixabay: Searching for image matching prompt: "${prompt}"`);
    
    try {
      const apiKey = process.env.PIXABAY_API_KEY;
      if (!apiKey) {
        throw new Error('PIXABAY_API_KEY is not defined in environment variables');
      }

      const url = `https://pixabay.com/api/?key=${apiKey}&q=${encodeURIComponent(prompt)}&image_type=photo`;
      const res = await globalThis.fetch(url);
      const data = await res.json();

      if (data && data.hits && data.hits.length > 0) {
        const imageUrl = data.hits[0].largeImageURL;
        this.logger.log(`Pixabay: Found image URL: ${imageUrl}`);
        return {
          providerJobId: `pixabay-image-${Date.now()}`,
          status: 'COMPLETED',
          mediaUrl: imageUrl
        };
      } else {
        throw new Error('No real photographs found for this query on Pixabay.');
      }
    } catch (e) {
      this.logger.error(`Pixabay search failed`, e);
      throw e;
    }
  }

  async generateVideo(prompt: string, model: string): Promise<AIProviderResult> {
    throw new Error('PixabayProvider does not implement generateVideo');
  }

  async checkStatus(jobId: string): Promise<AICheckStatusResult> {
    return { providerJobId: jobId, status: 'FAILED', error: 'Not implemented for Pixabay' };
  }
}
