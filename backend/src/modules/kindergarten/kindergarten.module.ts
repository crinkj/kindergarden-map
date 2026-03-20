import { Module } from '@nestjs/common';
import { KindergartenController } from './kindergarten.controller';
import { KindergartenService } from './kindergarten.service';
import { KindergartenRepository } from './kindergarten.repository';

@Module({
  controllers: [KindergartenController],
  providers: [KindergartenService, KindergartenRepository],
  exports: [KindergartenService],
})
export class KindergartenModule {}
