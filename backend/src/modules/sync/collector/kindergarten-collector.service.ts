import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';
import { PrismaService } from '../../../prisma/prisma.service';
import { SIDO_CODES } from '../../region/data/region-codes';

interface KindergartenApiItem {
  kindercode: string; // API returns lowercase
  officeedu: string;
  subofficeedu: string;
  kindername: string;
  establish?: string;
  edate?: string;
  odate?: string;
  addr?: string;
  telno?: string;
  hpaddr?: string;
  opertime?: string;
  clcnt3?: string | number;
  clcnt4?: string | number;
  clcnt5?: string | number;
  mixclcnt?: string | number;
  shclcnt?: string | number;
  prmstfcnt?: string | number;
  ag3fpcnt?: string | number;
  ag4fpcnt?: string | number;
  ag5fpcnt?: string | number;
  mixfpcnt?: string | number;
  spcnfpcnt?: string | number;
  ppcnt3?: string | number;
  ppcnt4?: string | number;
  ppcnt5?: string | number;
  mixppcnt?: string | number;
  shppcnt?: string | number;
  pbnttmng?: string;
  lttdcdnt?: string | number;
  lngtcdnt?: string | number;
}

interface ApiResponse {
  kinderInfo?: KindergartenApiItem[];
  totalCount?: number;
}

interface CollectionResult {
  totalCount: number;
  errorCount: number;
  errorLog?: string;
}

interface FailedRegion {
  sidoCode: string;
  sggCode: string;
  error: string;
  timestamp: string;
}

const MOCK_DATA: KindergartenApiItem[] = [
  {
    kindercode: 'B100000001',
    officeedu: '서울특별시교육청',
    subofficeedu: '강남교육지원청',
    kindername: '강남햇살유치원',
    establish: '사립',
    addr: '서울특별시 강남구 테헤란로 123',
    telno: '02-1234-5678',
    hpaddr: 'http://example.com',
    opertime: '09:00~17:00',
    edate: '20100301',
    clcnt3: 2, clcnt4: 2, clcnt5: 2, mixclcnt: 0, shclcnt: 1,
    prmstfcnt: 12,
    ag3fpcnt: 20, ag4fpcnt: 20, ag5fpcnt: 20, mixfpcnt: 0, spcnfpcnt: 5,
    ppcnt3: 18, ppcnt4: 19, ppcnt5: 17, mixppcnt: 0, shppcnt: 3,
    pbnttmng: '있음',
    lttdcdnt: 37.5020, lngtcdnt: 127.0470,
  },
  {
    kindercode: 'B100000002',
    officeedu: '서울특별시교육청',
    subofficeedu: '강남교육지원청',
    kindername: '삼성공립유치원',
    establish: '공립단설',
    addr: '서울특별시 강남구 삼성로 456',
    telno: '02-2345-6789',
    edate: '20050301',
    clcnt3: 3, clcnt4: 3, clcnt5: 3, mixclcnt: 0, shclcnt: 0,
    prmstfcnt: 15,
    ag3fpcnt: 25, ag4fpcnt: 25, ag5fpcnt: 25, mixfpcnt: 0, spcnfpcnt: 0,
    ppcnt3: 22, ppcnt4: 24, ppcnt5: 23, mixppcnt: 0, shppcnt: 0,
    pbnttmng: '없음',
    lttdcdnt: 37.5070, lngtcdnt: 127.0510,
  },
  {
    kindercode: 'B100000003',
    officeedu: '서울특별시교육청',
    subofficeedu: '강남교육지원청',
    kindername: '압구정어린이집부설유치원',
    establish: '공립병설',
    addr: '서울특별시 강남구 압구정로 789',
    telno: '02-3456-7890',
    opertime: '07:30~20:00',
    edate: '20080301',
    clcnt3: 1, clcnt4: 1, clcnt5: 1, mixclcnt: 1, shclcnt: 0,
    prmstfcnt: 8,
    ag3fpcnt: 15, ag4fpcnt: 15, ag5fpcnt: 15, mixfpcnt: 15, spcnfpcnt: 0,
    ppcnt3: 13, ppcnt4: 14, ppcnt5: 12, mixppcnt: 11, shppcnt: 0,
    pbnttmng: '있음',
    lttdcdnt: 37.5270, lngtcdnt: 127.0290,
  },
  {
    kindercode: 'B100000004',
    officeedu: '서울특별시교육청',
    subofficeedu: '강남교육지원청',
    kindername: '도곡사랑유치원',
    establish: '사립',
    addr: '서울특별시 강남구 도곡로 100',
    telno: '02-4567-8901',
    hpaddr: 'http://dogok-love.com',
    opertime: '08:00~19:00',
    edate: '20121001',
    clcnt3: 2, clcnt4: 2, clcnt5: 2, mixclcnt: 0, shclcnt: 0,
    prmstfcnt: 10,
    ag3fpcnt: 20, ag4fpcnt: 20, ag5fpcnt: 20, mixfpcnt: 0, spcnfpcnt: 0,
    ppcnt3: 19, ppcnt4: 18, ppcnt5: 20, mixppcnt: 0, shppcnt: 0,
    pbnttmng: '없음',
    lttdcdnt: 37.4870, lngtcdnt: 127.0440,
  },
  {
    kindercode: 'B100000005',
    officeedu: '서울특별시교육청',
    subofficeedu: '강남교육지원청',
    kindername: '대치꿈나무유치원',
    establish: '사립',
    addr: '서울특별시 강남구 대치동 500',
    telno: '02-5678-9012',
    opertime: '09:00~16:00',
    edate: '20150301',
    clcnt3: 1, clcnt4: 1, clcnt5: 1, mixclcnt: 0, shclcnt: 0,
    prmstfcnt: 6,
    ag3fpcnt: 15, ag4fpcnt: 15, ag5fpcnt: 15, mixfpcnt: 0, spcnfpcnt: 0,
    ppcnt3: 14, ppcnt4: 15, ppcnt5: 13, mixppcnt: 0, shppcnt: 0,
    pbnttmng: '없음',
    lttdcdnt: 37.4960, lngtcdnt: 127.0640,
  },
];

function toInt(v: string | number | undefined | null): number {
  if (v === undefined || v === null || v === '') return 0;
  const n = Number(v);
  return isNaN(n) ? 0 : Math.floor(n);
}

function toFloat(v: string | number | undefined | null): number | null {
  if (v === undefined || v === null || v === '') return null;
  const n = Number(v);
  return isNaN(n) ? null : n;
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

@Injectable()
export class KindergartenCollectorService {
  private readonly logger = new Logger(KindergartenCollectorService.name);
  private readonly apiKey: string | undefined;
  private readonly mockMode: boolean;
  private readonly rateLimitMs: number;
  private readonly timeoutMs: number;
  private readonly apiUrl =
    'https://e-childschoolinfo.moe.go.kr/api/notice/basicInfo2.do';

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {
    this.apiKey = this.config.get<string>('KINDERGARTEN_API_KEY');
    this.mockMode = this.config.get<string>('MOCK_MODE') === 'true';
    this.rateLimitMs = Number(this.config.get<string>('API_RATE_LIMIT_MS') ?? '300');
    this.timeoutMs = Number(this.config.get<string>('API_TIMEOUT_MS') ?? '10000');

    if (!this.mockMode && !this.apiKey) {
      this.logger.warn(
        'KINDERGARTEN_API_KEY is not set. Set MOCK_MODE=true or provide a valid API key.',
      );
    }
  }

  async fetchBasicInfo(
    sidoCode: string,
    sggCode: string,
    timing?: string,
    page = 1,
  ): Promise<KindergartenApiItem[]> {
    if (this.mockMode) {
      this.logger.debug(`[MOCK] Fetching ${sidoCode}/${sggCode}`);
      return MOCK_DATA;
    }

    if (!this.apiKey) {
      throw new Error('KINDERGARTEN_API_KEY is not configured');
    }

    const params: Record<string, string | number> = {
      key: this.apiKey,
      sidoCode,
      sggCode, // already 5-digit combined code (e.g. "11680")
      pageCnt: 100,
      currentPage: page,
    };

    if (timing) {
      params['timing'] = timing;
    }

    let lastError: Error | null = null;
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const response = await axios.get<ApiResponse>(this.apiUrl, {
          params,
          timeout: this.timeoutMs,
        });

        return response.data.kinderInfo ?? [];
      } catch (err) {
        lastError = err instanceof Error ? err : new Error(String(err));
        const backoffMs = 1000 * Math.pow(2, attempt);
        this.logger.warn(
          `Attempt ${attempt + 1} failed for ${sidoCode}/${sggCode}. Retrying in ${backoffMs}ms...`,
        );
        await delay(backoffMs);
      }
    }

    throw lastError ?? new Error('Unknown error');
  }

  async collectAll(
    filterSidoCode?: string,
    filterSggCode?: string,
  ): Promise<CollectionResult> {
    const failedRegions: FailedRegion[] = [];
    let totalCount = 0;
    let errorCount = 0;

    const sidoCodes = filterSidoCode
      ? [filterSidoCode]
      : Object.keys(SIDO_CODES);

    for (const sidoCode of sidoCodes) {
      let sggCodes: string[];

      if (filterSggCode) {
        sggCodes = [filterSggCode];
      } else {
        const regions = await this.prisma.regionCode.findMany({
          where: { sidoCode, sggCode: { not: null } },
          select: { sggCode: true },
          orderBy: { sggCode: 'asc' },
        });
        sggCodes = regions
          .map((r) => r.sggCode)
          .filter((c): c is string => c !== null);
      }

      for (const sggCode of sggCodes) {
        try {
          const items = await this.fetchBasicInfo(sidoCode, sggCode);
          await delay(this.rateLimitMs);

          for (const item of items) {
            await this.upsertKindergarten(item, sidoCode, sggCode);
            totalCount++;
          }

          this.logger.debug(
            `Collected ${items.length} items for ${sidoCode}/${sggCode}`,
          );
        } catch (err) {
          const message = err instanceof Error ? err.message : String(err);
          this.logger.error(
            `Failed to collect ${sidoCode}/${sggCode}: ${message}`,
          );
          errorCount++;
          failedRegions.push({
            sidoCode,
            sggCode,
            error: message,
            timestamp: new Date().toISOString(),
          });
        }
      }
    }

    if (failedRegions.length > 0) {
      await this.writeFailedRegions(failedRegions);
    }

    return {
      totalCount,
      errorCount,
      errorLog:
        failedRegions.length > 0 ? JSON.stringify(failedRegions) : undefined,
    };
  }

  private async upsertKindergarten(
    item: KindergartenApiItem,
    sidoCode: string,
    sggCode: string,
  ): Promise<void> {
    const clcnt3 = toInt(item.clcnt3);
    const clcnt4 = toInt(item.clcnt4);
    const clcnt5 = toInt(item.clcnt5);
    const mixclcnt = toInt(item.mixclcnt);
    const shclcnt = toInt(item.shclcnt);
    const ppcnt3 = toInt(item.ppcnt3);
    const ppcnt4 = toInt(item.ppcnt4);
    const ppcnt5 = toInt(item.ppcnt5);
    const mixppcnt = toInt(item.mixppcnt);
    const shppcnt = toInt(item.shppcnt);

    const totalClassCount = clcnt3 + clcnt4 + clcnt5 + mixclcnt + shclcnt;
    const totalChildCount = ppcnt3 + ppcnt4 + ppcnt5 + mixppcnt + shppcnt;

    const data = {
      officeedu: item.officeedu,
      subofficeedu: item.subofficeedu,
      kindername: item.kindername,
      establish: item.establish ?? null,
      edate: item.edate ?? null,
      odate: item.odate ?? null,
      addr: item.addr ?? null,
      telno: item.telno ?? null,
      hpaddr: item.hpaddr ?? null,
      opertime: item.opertime ?? null,
      clcnt3,
      clcnt4,
      clcnt5,
      mixclcnt,
      shclcnt,
      prmstfcnt: toInt(item.prmstfcnt),
      ag3fpcnt: toInt(item.ag3fpcnt),
      ag4fpcnt: toInt(item.ag4fpcnt),
      ag5fpcnt: toInt(item.ag5fpcnt),
      mixfpcnt: toInt(item.mixfpcnt),
      spcnfpcnt: toInt(item.spcnfpcnt),
      ppcnt3,
      ppcnt4,
      ppcnt5,
      mixppcnt,
      shppcnt,
      pbnttmng: item.pbnttmng ?? null,
      lttdcdnt: toFloat(item.lttdcdnt),
      lngtcdnt: toFloat(item.lngtcdnt),
      totalClassCount,
      totalChildCount,
      sidoCode,
      sggCode,
    };

    await this.prisma.kindergarten.upsert({
      where: { kinderCode: item.kindercode },
      update: { ...data, updatedAt: new Date() },
      create: { kinderCode: item.kindercode, ...data },
    });
  }

  private async writeFailedRegions(regions: FailedRegion[]): Promise<void> {
    try {
      const logsDir = path.join(process.cwd(), 'logs');
      if (!fs.existsSync(logsDir)) {
        fs.mkdirSync(logsDir, { recursive: true });
      }
      const filePath = path.join(logsDir, 'failed-regions.json');
      fs.writeFileSync(filePath, JSON.stringify(regions, null, 2), 'utf-8');
      this.logger.warn(`Written ${regions.length} failed regions to ${filePath}`);
    } catch (err) {
      this.logger.error('Failed to write failed-regions.json', err);
    }
  }
}
