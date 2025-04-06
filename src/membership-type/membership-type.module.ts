import { Module } from '@nestjs/common';
import { MembershipTypeService } from './membership-type.service';
import { MembershipTypeController } from './membership-type.controller';
import { PrismaService } from 'src/prisma.service';
import { ConfigService } from '@nestjs/config';

@Module({
  providers: [MembershipTypeService, PrismaService, ConfigService],
  controllers: [MembershipTypeController],
})
export class MembershipTypeModule {}
