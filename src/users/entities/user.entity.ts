import { Role } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class UserEntity {
  @ApiProperty({ example: '11a7c06c-8cd2-430c-ab22-263303666b37' })
  id!: string;

  @ApiProperty({ example: 'John Doe' })
  name!: string;

  @ApiProperty({ example: 'john@example.com' })
  email!: string;

  @ApiProperty({ enum: Role, example: Role.USER })
  role!: Role;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;

  constructor(partial: Partial<UserEntity>) {
    Object.assign(this, partial);
  }
}
