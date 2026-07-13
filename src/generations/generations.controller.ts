import { Controller, Post, Get, Delete, Body, Param, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { GenerationsService } from './generations.service';
import { CreateGenerationDto } from './dto/create-generation.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { GetUser } from '../common/decorators/get-user.decorator';
import { User, Role } from '@prisma/client';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiCreatedResponse, ApiOkResponse } from '@nestjs/swagger';

@ApiTags('generations')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller()
export class GenerationsController {
  constructor(private generationsService: GenerationsService) {}

  @Post('generate/image')
  @ApiOperation({ summary: 'Submit an asynchronous image generation job' })
  @ApiCreatedResponse({ description: 'Generation job successfully queued' })
  generateImage(@GetUser('id') userId: string, @Body() dto: CreateGenerationDto) {
    return this.generationsService.createImage(userId, dto.prompt, dto.model);
  }

  @Post('generate/video')
  @ApiOperation({ summary: 'Submit an asynchronous video generation job' })
  @ApiCreatedResponse({ description: 'Generation job successfully queued' })
  generateVideo(@GetUser('id') userId: string, @Body() dto: CreateGenerationDto) {
    return this.generationsService.createVideo(userId, dto.prompt, dto.model);
  }

  @Get('generation/:id')
  @ApiOperation({ summary: 'Retrieve generation job status and details' })
  @ApiOkResponse({ description: 'Generation details retrieved successfully' })
  findOne(
    @Param('id') id: string,
    @GetUser('id') userId: string,
    @GetUser('role') userRole: Role,
  ) {
    return this.generationsService.findOne(id, userId, userRole);
  }

  @Delete('generation/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a generation and cleanup stored assets' })
  @ApiOkResponse({ description: 'Generation deleted successfully' })
  delete(
    @Param('id') id: string,
    @GetUser('id') userId: string,
    @GetUser('role') userRole: Role,
  ) {
    return this.generationsService.delete(id, userId, userRole);
  }
}
