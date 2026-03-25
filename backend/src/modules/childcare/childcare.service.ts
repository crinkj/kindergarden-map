import { Injectable, NotFoundException } from '@nestjs/common';
import { Childcare } from '@prisma/client';
import { ChildcareRepository } from './childcare.repository';
import { SearchChildcareDto } from './dto/search-childcare.dto';

@Injectable()
export class ChildcareService {
  constructor(private readonly repo: ChildcareRepository) {}

  async search(dto: SearchChildcareDto) {
    const page = dto.page ?? 1;
    const limit = dto.limit ?? 100;
    const { items, total } = await this.repo.findMany(dto);

    return {
      data: items,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findAllAsCsv(dto: SearchChildcareDto): Promise<string> {
    const items = await this.repo.findAllForCsv(dto);
    return this.toCsv(items);
  }

  async getDetail(stcode: string) {
    const item = await this.repo.findOne(stcode);
    if (!item) throw new NotFoundException(`Childcare not found: ${stcode}`);
    return item;
  }

  private toCsv(items: Childcare[]): string {
    const headers = [
      '어린이집코드',
      '어린이집명',
      '유형',
      '상태',
      '시도',
      '시군구',
      '우편번호',
      '주소',
      '전화번호',
      '팩스',
      '홈페이지',
      '정원',
      '현원',
      '보육실수',
      'CCTV수',
      '통학차량수',
      '인가일',
      '위도',
      '경도',
    ];

    const rows = items.map((item) =>
      [
        item.stcode,
        item.crname,
        item.crtypename ?? '',
        item.crstatusname ?? '',
        item.sidoname ?? '',
        item.sigunguname ?? '',
        item.zipcode ?? '',
        item.craddr ?? '',
        item.crtelno ?? '',
        item.crfaxno ?? '',
        item.crhome ?? '',
        item.crcapat,
        item.crchcnt,
        item.nrtrroomcnt,
        item.cctvinstlcnt,
        item.chcrtescnt,
        item.frstcnfmdt ?? '',
        item.la ?? '',
        item.lo ?? '',
      ]
        .map((v) => `"${String(v).replace(/"/g, '""')}"`)
        .join(','),
    );

    return [headers.join(','), ...rows].join('\n');
  }
}
