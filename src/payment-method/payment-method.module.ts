import { Module } from '@nestjs/common';
import { PaymentMethodService } from './payment-method.service';
import { PaymentMethodController } from './payment-method.controller';
import { PrismaService } from 'src/prisma.service';
import { ConfigService } from '@nestjs/config';

@Module({
  providers: [PaymentMethodService, PrismaService, ConfigService],
  controllers: [PaymentMethodController],
})
export class PaymentMethodModule {}
