import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Generation, GenerationType, GenerationStatus } from '@prisma/client';

@Injectable()
export class HistoryService {
  constructor(private prisma: PrismaService) {}

  async getUserHistory(
    userId: string,
    filters?: {
      type?: GenerationType;
      status?: GenerationStatus;
      limit?: number;
      offset?: number;
    },
  ): Promise<Generation[]> {
    const limit = filters?.limit ? Number(filters.limit) : 50;
    const offset = filters?.offset ? Number(filters.offset) : 0;

    const whereClause: any = { userId };
    
    if (filters?.type) {
      whereClause.type = filters.type;
    }
    
    if (filters?.status) {
      whereClause.status = filters.status;
    }

    return this.prisma.generation.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
      include: { jobs: true },
    });
  }
}
