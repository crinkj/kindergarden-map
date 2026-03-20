import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { KindergartenCollectorService } from './collector/kindergarten-collector.service';
import { SyncJob } from '@prisma/client';

interface StartSyncOptions {
  jobType: 'full' | 'sido' | 'sgg';
  targetCode?: string;
}

interface StartSyncResult {
  jobId: number;
  status: string;
  message: string;
}

interface SyncJobListResult {
  data: SyncJob[];
  meta: { total: number; page: number; limit: number; totalPages: number };
}

@Injectable()
export class SyncService {
  private readonly logger = new Logger(SyncService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly collector: KindergartenCollectorService,
  ) {}

  async startSync(options: StartSyncOptions): Promise<StartSyncResult> {
    const job = await this.prisma.syncJob.create({
      data: {
        status: 'running',
        jobType: options.jobType,
        targetCode: options.targetCode ?? null,
        startedAt: new Date(),
      },
    });

    this.logger.log(`SyncJob #${job.id} started (type: ${options.jobType})`);

    // Run collection in background (non-blocking)
    this.runCollectionAsync(job.id, options).catch((err: unknown) => {
      const message = err instanceof Error ? err.message : String(err);
      this.logger.error(`SyncJob #${job.id} failed: ${message}`);
    });

    return {
      jobId: job.id,
      status: 'running',
      message: '동기화가 시작되었습니다.',
    };
  }

  private async runCollectionAsync(jobId: number, options: StartSyncOptions): Promise<void> {
    try {
      let filterSidoCode: string | undefined;
      let filterSggCode: string | undefined;

      if (options.jobType === 'sido') {
        // 특정 시도 전체 시군구 순회
        filterSidoCode = options.targetCode;
        filterSggCode = undefined;
      } else if (options.jobType === 'sgg') {
        // targetCode 형식: "sidoCode:sggCode" 또는 syncJob의 targetCode가 sggCode만 있을 때
        // admin controller에서 sidoCode+sggCode를 "sidoCode:sggCode" 형식으로 전달하도록 변경
        if (options.targetCode?.includes(':')) {
          const [sido, sgg] = options.targetCode.split(':');
          filterSidoCode = sido;
          filterSggCode = sgg;
        } else {
          // targetCode가 sggCode만 있는 경우 — sido 없이는 특정 불가, 전체 순회
          filterSggCode = options.targetCode;
        }
      }
      // jobType === 'full': 둘 다 undefined → 전국 순회

      const result = await this.collector.collectAll(filterSidoCode, filterSggCode);

      await this.prisma.syncJob.update({
        where: { id: jobId },
        data: {
          status: result.errorCount > 0 ? 'completed_with_errors' : 'completed',
          totalCount: result.totalCount,
          errorCount: result.errorCount,
          errorLog: result.errorLog ?? null,
          completedAt: new Date(),
        },
      });

      this.logger.log(
        `SyncJob #${jobId} completed. total: ${result.totalCount}, errors: ${result.errorCount}`,
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      await this.prisma.syncJob.update({
        where: { id: jobId },
        data: {
          status: 'failed',
          errorLog: message,
          completedAt: new Date(),
        },
      });
    }
  }

  async getSyncJobs(page = 1, limit = 20): Promise<SyncJobListResult> {
    const skip = (page - 1) * limit;
    const [jobs, total] = await Promise.all([
      this.prisma.syncJob.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.syncJob.count(),
    ]);

    return {
      data: jobs,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
