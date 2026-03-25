import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { SyncService } from '../sync/sync.service';

interface StartSyncBody {
  jobType: 'full' | 'sido' | 'sgg' | 'childcare';
  targetCode?: string;
}

@Controller('api/admin')
export class AdminController {
  constructor(private readonly syncService: SyncService) {}

  @Post('sync')
  async startSync(
    @Body() body: StartSyncBody,
  ): Promise<{ jobId: number; status: string; message: string }> {
    return this.syncService.startSync({
      jobType: body.jobType ?? 'full',
      targetCode: body.targetCode,
    });
  }

  @Get('sync/jobs')
  async getSyncJobs(
    @Query('page') page = '1',
    @Query('limit') limit = '20',
  ): Promise<ReturnType<SyncService['getSyncJobs']>> {
    return this.syncService.getSyncJobs(Number(page), Number(limit));
  }
}
