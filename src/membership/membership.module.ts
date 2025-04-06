import { Module } from '@nestjs/common';
import { MembershipService } from './membership.service';
import { MembershipController } from './membership.controller';
import { PrismaService } from 'src/prisma.service';
import { ScheduleModule } from '@nestjs/schedule';
import { MembershipTasks } from './membership.task';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [ScheduleModule.forRoot()],
  providers: [MembershipService, PrismaService, MembershipTasks, ConfigService],
  controllers: [MembershipController],
  exports: [MembershipService],
})
export class MembershipModule {}
