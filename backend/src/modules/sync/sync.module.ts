import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { SyncService } from './sync.service';
import { KindergartenCollectorService } from './collector/kindergarten-collector.service';

@Module({
  imports: [HttpModule, ConfigModule],
  providers: [SyncService, KindergartenCollectorService],
  exports: [SyncService],
})
export class SyncModule {}
