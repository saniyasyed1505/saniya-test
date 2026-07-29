import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ShareService {
  constructor(private prisma: PrismaService) {}

  async getSharedMedia(id: string) {
    const generation = await this.prisma.generation.findUnique({
      where: { id },
      include: {
        user: { select: { name: true } }
      }
    });

    if (!generation || generation.status !== 'COMPLETED') {
      throw new NotFoundException('Shared media not found or not ready.');
    }

    // Increment views automatically when fetching
    await this.prisma.generation.update({
      where: { id },
      data: { views: { increment: 1 } }
    });

    return {
      id: generation.id,
      type: generation.type,
      prompt: generation.prompt,
      mediaUrl: generation.mediaUrl,
      thumbnailUrl: generation.thumbnailUrl,
      memeData: generation.memeData,
      createdAt: generation.createdAt,
      author: generation.user.name,
      downloads: generation.downloads,
      shares: generation.shares,
      views: generation.views + 1
    };
  }

  async trackEvent(id: string, event: 'download' | 'share' | 'copy') {
    const generation = await this.prisma.generation.findUnique({ where: { id } });
    if (!generation) throw new NotFoundException('Generation not found');

    if (event === 'download') {
      await this.prisma.generation.update({ where: { id }, data: { downloads: { increment: 1 } } });
    } else if (event === 'share' || event === 'copy') {
      await this.prisma.generation.update({ where: { id }, data: { shares: { increment: 1 } } });
    }

    return { success: true };
  }
}
