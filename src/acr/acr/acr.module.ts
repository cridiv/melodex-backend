import { Module } from '@nestjs/common';
import { AcrService } from './acr.service';

@Module({
  providers: [AcrService],
  exports: [AcrService],
})
export class AcrModule {}
