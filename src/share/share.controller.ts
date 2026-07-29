import { Controller, Get, Param, Post, Body } from '@nestjs/common';
import { ShareService } from './share.service';
import { ApiTags, ApiOperation, ApiOkResponse } from '@nestjs/swagger';

@ApiTags('share')
@Controller('share')
export class ShareController {
  constructor(private readonly shareService: ShareService) {}

  @Get(':id')
  @ApiOperation({ summary: 'Get details of a shared generation' })
  @ApiOkResponse({ description: 'Public details of the generation' })
  getSharedMedia(@Param('id') id: string) {
    return this.shareService.getSharedMedia(id);
  }

  @Post(':id/track')
  @ApiOperation({ summary: 'Track a share or download event' })
  @ApiOkResponse({ description: 'Event tracked successfully' })
  trackEvent(
    @Param('id') id: string,
    @Body('event') event: 'download' | 'share' | 'copy'
  ) {
    return this.shareService.trackEvent(id, event);
  }
}
