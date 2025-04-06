import { Module } from '@nestjs/common';
import { CustomerServiceService } from './customer-service.service';
import { CustomerServiceController } from './customer-service.controller';

@Module({
  providers: [CustomerServiceService],
  controllers: [CustomerServiceController]
})
export class CustomerServiceModule {}
