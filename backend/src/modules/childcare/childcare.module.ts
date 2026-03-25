import { Module } from '@nestjs/common';
import { ChildcareController } from './childcare.controller';
import { ChildcareService } from './childcare.service';
import { ChildcareRepository } from './childcare.repository';

@Module({
  controllers: [ChildcareController],
  providers: [ChildcareService, ChildcareRepository],
  exports: [ChildcareService],
})
export class ChildcareModule {}
