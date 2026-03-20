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
