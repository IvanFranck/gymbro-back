import { Module } from '@nestjs/common';
import { MembershipTypeService } from './membership-type.service';
import { MembershipTypeController } from './membership-type.controller';
import { PrismaService } from 'src/prisma.service';
import { ConfigService } from '@nestjs/config';
import { MembershipTypeServiceService } from 'src/membership-type-service/membership-type-service.service';

@Module({
  providers: [
    MembershipTypeService,
    PrismaService,
    ConfigService,
    MembershipTypeServiceService,
  ],
  controllers: [MembershipTypeController],
})
export class MembershipTypeModule {}
