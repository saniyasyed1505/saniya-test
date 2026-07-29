import { Injectable, NotFoundException, ForbiddenException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JobsService } from '../jobs/jobs.service';
import { StorageService } from '../storage/storage.service';
import { Generation, GenerationType, GenerationStatus, Role } from '@prisma/client';

@Injectable()
export class GenerationsService {
  private readonly logger = new Logger(GenerationsService.name);

  constructor(
    private prisma: PrismaService,
    private jobsService: JobsService,
    private storageService: StorageService,
  ) {}

  async createImage(userId: string, prompt: string, model: string): Promise<{ generationId: string }> {
    this.logger.log(`Creating image generation entry for user ${userId} - Prompt: "${prompt}"`);
    const generation = await this.prisma.generation.create({
      data: {
        userId,
        type: GenerationType.IMAGE,
        prompt,
        model,
        status: GenerationStatus.QUEUED,
      },
    });

    await this.jobsService.queueImageGeneration(generation.id);
    return { generationId: generation.id };
  }

  async createVideo(userId: string, prompt: string, model: string): Promise<{ generationId: string }> {
    this.logger.log(`Creating video generation entry for user ${userId} - Prompt: "${prompt}"`);
    const generation = await this.prisma.generation.create({
      data: {
        userId,
        type: GenerationType.VIDEO,
        prompt,
        model,
        status: GenerationStatus.QUEUED,
      },
    });

    await this.jobsService.queueVideoGeneration(generation.id);
    return { generationId: generation.id };
  }
  async createMeme(userId: string, prompt: string, mode: string, template?: string): Promise<{ generationId: string }> {
    this.logger.log(`Creating meme generation entry for user ${userId} - Prompt: "${prompt}"`);
    const generation = await this.prisma.generation.create({
      data: {
        userId,
        type: GenerationType.MEME,
        prompt,
        model: 'pollinations-text',
        status: GenerationStatus.QUEUED,
        memeData: { mode, template }
      },
    });

    await this.jobsService.queueMemeGeneration(generation.id);
    return { generationId: generation.id };
  }

  async regenerate(id: string, userId: string, options?: { seedMode?: 'same' | 'random' }): Promise<{ generationId: string }> {
    const original = await this.prisma.generation.findUnique({ where: { id } });
    
    if (!original) throw new NotFoundException(`Generation ${id} not found`);
    if (original.userId !== userId) throw new ForbiddenException('Forbidden');
    if (original.retryCount >= 5) throw new Error('Retry limit reached');

    const seed = options?.seedMode === 'same' ? original.seed : null;

    const updatedGeneration = await this.prisma.generation.update({
      where: { id },
      data: {
        seed,
        status: GenerationStatus.QUEUED,
        errorMessage: null,
        retryCount: original.retryCount + 1,
      }
    });

    if (updatedGeneration.type === GenerationType.IMAGE) {
      await this.jobsService.queueImageGeneration(updatedGeneration.id);
    } else if (updatedGeneration.type === GenerationType.VIDEO) {
      await this.jobsService.queueVideoGeneration(updatedGeneration.id);
    } else if (updatedGeneration.type === GenerationType.MEME) {
      await this.jobsService.queueMemeGeneration(updatedGeneration.id);
    }

    return { generationId: updatedGeneration.id };
  }

  async toggleFavorite(id: string, userId: string, userRole: Role): Promise<{ isFavorite: boolean }> {
    const generation = await this.prisma.generation.findUnique({ where: { id } });
    if (!generation) throw new NotFoundException(`Generation ${id} not found`);
    if (generation.userId !== userId && userRole !== Role.ADMIN) throw new ForbiddenException('Forbidden');
    
    const updated = await this.prisma.generation.update({
      where: { id },
      data: { isFavorite: !generation.isFavorite }
    });
    return { isFavorite: updated.isFavorite };
  }

  async findOne(id: string, userId: string, userRole: Role): Promise<Generation> {
    const generation = await this.prisma.generation.findUnique({
      where: { id },
      include: { jobs: true },
    });

    if (!generation) {
      throw new NotFoundException(`Generation record with ID ${id} not found`);
    }

    if (generation.userId !== userId && userRole !== Role.ADMIN) {
      throw new ForbiddenException('You do not have permission to access this generation');
    }

    return generation;
  }

  async delete(id: string, userId: string, userRole: Role): Promise<{ success: boolean }> {
    const generation = await this.prisma.generation.findUnique({
      where: { id },
    });

    if (!generation) {
      throw new NotFoundException(`Generation record with ID ${id} not found`);
    }

    if (generation.userId !== userId && userRole !== Role.ADMIN) {
      throw new ForbiddenException('You do not have permission to delete this generation');
    }

    // Try clean up associated media from storage
    if (generation.mediaUrl) {
      try {
        const pathParts = generation.mediaUrl.split('/generations/');
        if (pathParts.length > 1) {
          const relativeStoragePath = `generations/${pathParts[1]}`;
          await this.storageService.delete(relativeStoragePath);
        }
      } catch (err: any) {
        this.logger.error(`Failed to delete media asset for generation ${id}: ${err.message}`);
      }
    }

    await this.prisma.generation.delete({
      where: { id },
    });

    return { success: true };
  }
}
