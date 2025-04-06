import { Module } from '@nestjs/common';
import { CustomerService } from './customer.service';
import { CustomerController } from './customer.controller';
import { PrismaService } from 'src/prisma.service';
import { ConfigService } from '@nestjs/config';

@Module({
  providers: [CustomerService, PrismaService, ConfigService],
  controllers: [CustomerController],
})
export class CustomerModule {}
