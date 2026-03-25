import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import * as xml2js from 'xml2js';
import { PrismaService } from '../../../prisma/prisma.service';

interface ChildcareApiItem {
  stcode?: string[];
  crname?: string[];
  crtypename?: string[];
  crstatusname?: string[];
  sidoname?: string[];
  sigunguname?: string[];
  arcode?: string[];
  zipcode?: string[];
  craddr?: string[];
  crtelno?: string[];
  crfaxno?: string[];
  crhome?: string[];
  crcapat?: string[];
  crchcnt?: string[];
  la?: string[];
  lo?: string[];
  nrtrroomcnt?: string[];
  cctvinstlcnt?: string[];
  chcrtescnt?: string[];
  crspec?: string[];
  crcnfmdt?: string[];
  frstcnfmdt?: string[];
}

interface CollectionResult {
  totalCount: number;
  errorCount: number;
  errorLog?: string;
}

interface FailedRegion {
  arcode: string;
  error: string;
  timestamp: string;
}

// Standard 5-digit arcode list for childcare API
// Format: sido(2) + sgg(3) — matches 유치원알리미 sgg code format
const CHILDCARE_ARCODES: string[] = [
  // 서울 (11)
  '11010','11020','11030','11040','11050','11060','11070','11080','11090',
  '11100','11110','11120','11130','11140','11150','11160','11170','11180',
  '11190','11200','11210','11220','11230','11240','11250',
  // 부산 (26)
  '26010','26020','26030','26040','26050','26060','26070','26080','26090',
  '26100','26110','26140','26170','26200','26230','26260',
  // 대구 (27)
  '27010','27020','27030','27040','27050','27060','27070','27140','27200','27710',
  // 인천 (28)
  '28010','28020','28030','28040','28050','28060','28070','28080','28110','28140','28177','28185','28200','28237',
  // 광주 (29)
  '29010','29020','29030','29040','29050',
  // 대전 (30)
  '30010','30020','30030','30040','30050',
  // 울산 (31)
  '31010','31020','31030','31040','31050','31710',
  // 세종 (36)
  '36110',
  // 경기 (41)
  '41110','41130','41150','41170','41190','41210','41220','41230','41250','41270',
  '41280','41290','41310','41360','41390','41410','41430','41450','41460','41480',
  '41500','41550','41570','41590','41610','41630','41650','41670','41690','41710',
  '41720','41730','41750','41770','41800','41820','41830',
  // 강원 (42)
  '42110','42130','42150','42170','42190','42210','42230','42250','42270','42710',
  '42720','42730','42750','42760','42770','42780','42790','42800',
  // 충북 (43)
  '43110','43130','43150','43720','43730','43740','43745','43750','43760','43770','43800',
  // 충남 (44)
  '44130','44150','44180','44200','44210','44230','44250','44270','44710','44720',
  '44730','44740','44750','44760','44770','44790','44800','44810',
  // 전북 (45)
  '45110','45130','45140','45150','45160','45180','45190','45210','45710','45720',
  '45730','45740','45750','45760','45770','45780','45790','45800',
  // 전남 (46)
  '46110','46130','46150','46170','46710','46720','46730','46740','46750','46760',
  '46770','46780','46790','46800','46810','46820','46830','46840','46850','46860','46870',
  // 경북 (47)
  '47110','47130','47150','47170','47190','47210','47230','47250','47280','47290',
  '47720','47730','47740','47745','47750','47760','47770','47780','47790','47800',
  '47820','47830','47840','47850','47900','47920','47930',
  // 경남 (48)
  '48120','48170','48220','48240','48250','48270','48310','48330','48720','48730',
  '48740','48750','48760','48770','48780','48790','48800','48820','48840','48850','48860','48870','48880',
  // 제주 (50)
  '50110','50130',
];

function toInt(v: string | string[] | undefined | null): number {
  if (!v) return 0;
  const s = Array.isArray(v) ? v[0] : v;
  if (!s || s.trim() === '') return 0;
  const n = Number(s);
  return isNaN(n) ? 0 : Math.floor(n);
}

function toFloat(v: string | string[] | undefined | null): number | null {
  if (!v) return null;
  const s = Array.isArray(v) ? v[0] : v;
  if (!s || s.trim() === '') return null;
  const n = Number(s);
  return isNaN(n) ? null : n;
}

function toString(v: string | string[] | undefined | null): string | null {
  if (!v) return null;
  const s = Array.isArray(v) ? v[0] : v;
  return s && s.trim() !== '' ? s.trim() : null;
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

@Injectable()
export class ChildcareCollectorService {
  private readonly logger = new Logger(ChildcareCollectorService.name);
  private readonly apiKey: string | undefined;
  private readonly mockMode: boolean;
  private readonly rateLimitMs: number;
  private readonly timeoutMs: number;
  private readonly apiUrl =
    'http://api.childcare.go.kr/mediate/rest/cpmsapi030/cpmsapi030/request';

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {
    this.apiKey = this.config.get<string>('CHILDCARE_API_KEY');
    this.mockMode = this.config.get<string>('MOCK_MODE') === 'true';
    this.rateLimitMs = Number(this.config.get<string>('API_RATE_LIMIT_MS') ?? '300');
    this.timeoutMs = Number(this.config.get<string>('API_TIMEOUT_MS') ?? '10000');

    if (!this.mockMode && !this.apiKey) {
      this.logger.warn(
        'CHILDCARE_API_KEY is not set. Set MOCK_MODE=true or provide CHILDCARE_API_KEY.',
      );
    }
  }

  async fetchByArcode(arcode: string): Promise<ChildcareApiItem[]> {
    if (this.mockMode) {
      this.logger.debug(`[MOCK] Fetching childcare for arcode=${arcode}`);
      return [];
    }

    if (!this.apiKey) {
      throw new Error('CHILDCARE_API_KEY is not configured');
    }

    let lastError: Error | null = null;
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const response = await axios.get<string>(this.apiUrl, {
          params: { key: this.apiKey, arcode },
          timeout: this.timeoutMs,
          responseType: 'text',
        });

        const parsed = await xml2js.parseStringPromise(response.data);
        // XML structure: <response><item>...</item></response> or <response><list><item>...</item></list></response>
        const root = parsed?.response ?? parsed?.Response ?? {};
        const items: ChildcareApiItem[] =
          root?.item ?? root?.list?.[0]?.item ?? root?.items?.[0]?.item ?? [];

        return Array.isArray(items) ? items : [items];
      } catch (err) {
        lastError = err instanceof Error ? err : new Error(String(err));
        const backoffMs = 1000 * Math.pow(2, attempt);
        this.logger.warn(
          `Attempt ${attempt + 1} failed for arcode=${arcode}. Retrying in ${backoffMs}ms...`,
        );
        await delay(backoffMs);
      }
    }

    throw lastError ?? new Error('Unknown error');
  }

  async collectAll(filterArcode?: string): Promise<CollectionResult> {
    const failedRegions: FailedRegion[] = [];
    let totalCount = 0;
    let errorCount = 0;

    const arcodes = filterArcode ? [filterArcode] : CHILDCARE_ARCODES;

    for (const arcode of arcodes) {
      try {
        const items = await this.fetchByArcode(arcode);
        await delay(this.rateLimitMs);

        for (const item of items) {
          await this.upsertChildcare(item, arcode);
          totalCount++;
        }

        this.logger.debug(`Collected ${items.length} childcares for arcode=${arcode}`);
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        this.logger.error(`Failed to collect arcode=${arcode}: ${message}`);
        errorCount++;
        failedRegions.push({ arcode, error: message, timestamp: new Date().toISOString() });
      }
    }

    return {
      totalCount,
      errorCount,
      errorLog: failedRegions.length > 0 ? JSON.stringify(failedRegions) : undefined,
    };
  }

  private async upsertChildcare(item: ChildcareApiItem, arcode: string): Promise<void> {
    const stcode = toString(item.stcode);
    if (!stcode) return; // skip items without code

    const data = {
      crname: toString(item.crname) ?? '(이름없음)',
      crtypename: toString(item.crtypename),
      crstatusname: toString(item.crstatusname),
      sidoname: toString(item.sidoname),
      sigunguname: toString(item.sigunguname),
      arcode,
      zipcode: toString(item.zipcode),
      craddr: toString(item.craddr),
      crtelno: toString(item.crtelno),
      crfaxno: toString(item.crfaxno),
      crhome: toString(item.crhome),
      crcapat: toInt(item.crcapat),
      crchcnt: toInt(item.crchcnt),
      la: toFloat(item.la),
      lo: toFloat(item.lo),
      nrtrroomcnt: toInt(item.nrtrroomcnt),
      cctvinstlcnt: toInt(item.cctvinstlcnt),
      chcrtescnt: toInt(item.chcrtescnt),
      crspec: toString(item.crspec),
      crcnfmdt: toString(item.crcnfmdt),
      frstcnfmdt: toString(item.frstcnfmdt),
    };

    await this.prisma.childcare.upsert({
      where: { stcode },
      update: { ...data, updatedAt: new Date() },
      create: { stcode, ...data },
    });
  }
}
