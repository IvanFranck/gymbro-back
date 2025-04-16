import { Module } from '@nestjs/common';
import { MembershipTypeServiceService } from './membership-type-service.service';
import { PrismaService } from 'src/prisma.service';
import { ConfigService } from '@nestjs/config';

@Module({
  providers: [MembershipTypeServiceService, PrismaService, ConfigService],
})
export class MembershipTypeServiceModule {}
