import { Controller, Get, UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiOkResponse } from '@nestjs/swagger';

@ApiTags('admin')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
@Controller('admin')
export class AdminController {
  constructor(private adminService: AdminService) {}

  @Get('users')
  @ApiOperation({ summary: 'Retrieve details of all registered users (Admin only)' })
  @ApiOkResponse({ description: 'List of users retrieved successfully' })
  getUsers() {
    return this.adminService.getAllUsers();
  }

  @Get('generations')
  @ApiOperation({ summary: 'Retrieve list of all generation requests (Admin only)' })
  @ApiOkResponse({ description: 'List of generations retrieved successfully' })
  getGenerations() {
    return this.adminService.getAllGenerations();
  }
}
