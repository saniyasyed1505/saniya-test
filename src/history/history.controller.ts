import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { HistoryService } from './history.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { GetUser } from '../common/decorators/get-user.decorator';
import { GenerationType, GenerationStatus } from '@prisma/client';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery, ApiOkResponse } from '@nestjs/swagger';

@ApiTags('generations')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('history')
export class HistoryController {
  constructor(private historyService: HistoryService) {}

  @Get()
  @ApiOperation({ summary: "Retrieve the authenticated user's generation history" })
  @ApiQuery({ name: 'type', enum: GenerationType, required: false })
  @ApiQuery({ name: 'status', enum: GenerationStatus, required: false })
  @ApiQuery({ name: 'limit', type: Number, required: false })
  @ApiQuery({ name: 'offset', type: Number, required: false })
  @ApiOkResponse({ description: 'List of generations matching filters' })
  getHistory(
    @GetUser('id') userId: string,
    @Query('type') type?: GenerationType,
    @Query('status') status?: GenerationStatus,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ) {
    return this.historyService.getUserHistory(userId, { type, status, limit, offset });
  }
}
