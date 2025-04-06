import { Module } from '@nestjs/common';
import { CustomerServiceService } from './customer-service.service';

@Module({
  providers: [CustomerServiceService]
})
export class CustomerServiceModule {}
