import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { GetUser } from '../common/decorators/get-user.decorator';
import { UserEntity } from './entities/user.entity';
import { User } from '@prisma/client';

@ApiTags('users')
@ApiBearerAuth()
@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  @Get('profile')
  @ApiOkResponse({ type: UserEntity, description: 'Get current user profile' })
  getProfile(@GetUser() user: User) {
    return new UserEntity(user);
  }
}
