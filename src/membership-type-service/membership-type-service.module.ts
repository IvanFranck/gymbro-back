import { Module } from '@nestjs/common';
import { MembershipTypeServiceService } from './membership-type-service.service';
import { PrismaService } from 'src/prisma.service';
import { ConfigService } from '@nestjs/config';
import { MembershipTypeServiceController } from './membership-type-service.controller';

@Module({
  providers: [MembershipTypeServiceService, PrismaService, ConfigService],
  controllers: [MembershipTypeServiceController],
})
export class MembershipTypeServiceModule {}
