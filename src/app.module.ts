import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import * as Joi from 'joi';
import { ConfigModule } from '@nestjs/config';
import { PrismaService } from './prisma.service';
import { CustomerModule } from './customer/customer.module';
import { MembershipModule } from './membership/membership.module';
import { MembershipTypeModule } from './membership-type/membership-type.module';
import { StatusModule } from './status/status.module';
import { PaymentMethodModule } from './payment-method/payment-method.module';
import { GymServiceModule } from './gym-service/gym-service.module';
import { CustomerServiceModule } from './customer-service/customer-service.module';
import { MembershipTypeServiceModule } from './membership-type-service/membership-type-service.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      validationSchema: Joi.object({
        NODE_ENV: Joi.string()
          .valid('development', 'production', 'test')
          .default('development'),
        PORT: Joi.number().port().default(3000),
      }),
    }),
    CustomerModule,
    MembershipModule,
    MembershipTypeModule,
    StatusModule,
    PaymentMethodModule,
    GymServiceModule,
    CustomerServiceModule,
    MembershipTypeServiceModule,
  ],
  controllers: [AppController],
  providers: [AppService, PrismaService],
})
export class AppModule {}
