import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { SyncService } from './sync.service';
import { KindergartenCollectorService } from './collector/kindergarten-collector.service';
import { ChildcareCollectorService } from './collector/childcare-collector.service';

@Module({
  imports: [HttpModule, ConfigModule],
  providers: [SyncService, KindergartenCollectorService, ChildcareCollectorService],
  exports: [SyncService],
})
export class SyncModule {}
