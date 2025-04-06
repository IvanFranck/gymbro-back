import { Module } from '@nestjs/common';
import { MembershipService } from './membership.service';
import { MembershipController } from './membership.controller';
import { PrismaService } from 'src/prisma.service';
import { ScheduleModule } from '@nestjs/schedule';
import { MembershipTasks } from './membership.task';

@Module({
  imports: [ScheduleModule.forRoot()],
  providers: [MembershipService, PrismaService, MembershipTasks],
  controllers: [MembershipController],
  exports: [MembershipService],
})
export class MembershipModule {}
