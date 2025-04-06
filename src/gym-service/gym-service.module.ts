import { Module } from '@nestjs/common';
import { GymServiceService } from './gym-service.service';

@Module({
  providers: [GymServiceService],
})
export class GymServiceModule {}
