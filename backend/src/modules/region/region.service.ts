import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { SIDO_CODES } from './data/region-codes';

interface SidoItem {
  code: string;
  name: string;
}

interface SggItem {
  sidoCode: string;
  sggCode: string;
  name: string;
}

@Injectable()
export class RegionService {
  constructor(private readonly prisma: PrismaService) {}

  getSidoList(): SidoItem[] {
    return Object.entries(SIDO_CODES).map(([code, name]) => ({ code, name }));
  }

  async getStats(sidoCode?: string): Promise<{ code: string; name: string; count: number; totalChildren: number }[]> {
    if (sidoCode) {
      // 시군구별 통계
      const rows = await this.prisma.kindergarten.groupBy({
        by: ['sggCode'],
        where: { sidoCode },
        _count: { kinderCode: true },
        _sum: { totalChildCount: true },
        orderBy: { _count: { kinderCode: 'desc' } },
      });

      const regions = await this.prisma.regionCode.findMany({
        where: { sidoCode, sggCode: { not: null } },
        select: { sggCode: true, sggName: true },
      });
      const nameMap = new Map(regions.map((r) => [r.sggCode, r.sggName ?? '']));

      return rows.map((r) => ({
        code: r.sggCode ?? '',
        name: nameMap.get(r.sggCode ?? '') ?? r.sggCode ?? '',
        count: r._count.kinderCode,
        totalChildren: r._sum.totalChildCount ?? 0,
      }));
    } else {
      // 시도별 통계
      const rows = await this.prisma.kindergarten.groupBy({
        by: ['sidoCode'],
        _count: { kinderCode: true },
        _sum: { totalChildCount: true },
        orderBy: { _count: { kinderCode: 'desc' } },
      });

      const sidoMap = SIDO_CODES;
      return rows.map((r) => ({
        code: r.sidoCode ?? '',
        name: sidoMap[r.sidoCode ?? ''] ?? r.sidoCode ?? '',
        count: r._count.kinderCode,
        totalChildren: r._sum.totalChildCount ?? 0,
      }));
    }
  }

  async getSggList(sidoCode: string): Promise<SggItem[]> {
    const regions = await this.prisma.regionCode.findMany({
      where: {
        sidoCode,
        sggCode: { not: null },
      },
      orderBy: { sggCode: 'asc' },
    });

    return regions
      .filter((r) => r.sggCode !== null && r.sggName !== null)
      .map((r) => ({
        sidoCode: r.sidoCode,
        sggCode: r.sggCode as string,
        name: r.sggName as string,
      }));
  }
}
