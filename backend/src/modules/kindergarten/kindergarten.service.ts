import { Injectable, NotFoundException } from '@nestjs/common';
import { Kindergarten } from '@prisma/client';
import { KindergartenRepository } from './kindergarten.repository';
import { SearchKindergartenDto } from './dto/search-kindergarten.dto';
import {
  KindergartenDetailDto,
  KindergartenListItemDto,
  KindergartenListResponseDto,
} from './dto/kindergarten-response.dto';

@Injectable()
export class KindergartenService {
  constructor(private readonly repository: KindergartenRepository) {}

  async findAll(dto: SearchKindergartenDto): Promise<KindergartenListResponseDto> {
    const page = dto.page ?? 1;
    const limit = dto.limit ?? 100;
    const { items, total } = await this.repository.findAll(dto);

    return {
      data: items.map((item: Kindergarten) => this.toListItem(item)),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findAllAsCsv(dto: SearchKindergartenDto): Promise<string> {
    const items = await this.repository.findAllForCsv(dto);
    return this.toCsv(items);
  }

  async findByKinderCode(kinderCode: string): Promise<KindergartenDetailDto> {
    const item = await this.repository.findByKinderCode(kinderCode);
    if (!item) {
      throw new NotFoundException(`유치원을 찾을 수 없습니다: ${kinderCode}`);
    }
    return item as KindergartenDetailDto;
  }

  private toListItem(item: Kindergarten): KindergartenListItemDto {
    return {
      kinderCode: item.kinderCode,
      kindername: item.kindername,
      establish: item.establish,
      addr: item.addr,
      telno: item.telno,
      lttdcdnt: item.lttdcdnt,
      lngtcdnt: item.lngtcdnt,
      totalClassCount: item.totalClassCount,
      totalChildCount: item.totalChildCount,
      prmstfcnt: item.prmstfcnt,
      sidoCode: item.sidoCode,
      sggCode: item.sggCode,
      updatedAt: item.updatedAt,
    };
  }

  private toCsv(items: Kindergarten[]): string {
    const headers = [
      '유치원코드',
      '시도교육청',
      '시군구교육청',
      '유치원명',
      '설립유형',
      '우편번호',
      '주소',
      '전화번호',
      '홈페이지',
      '운영시간',
      '개원일',
      '총학급수',
      '총원아수',
      '위도',
      '경도',
    ];

    const rows = items.map((item) =>
      [
        item.kinderCode,
        item.officeedu,
        item.subofficeedu,
        item.kindername,
        item.establish ?? '',
        item.zipcode ?? '',
        item.addr ?? '',
        item.telno ?? '',
        item.hpaddr ?? '',
        item.opertime ?? '',
        item.edate ?? '',
        item.totalClassCount,
        item.totalChildCount,
        item.lttdcdnt ?? '',
        item.lngtcdnt ?? '',
      ]
        .map((v) => `"${String(v).replace(/"/g, '""')}"`)
        .join(','),
    );

    return [headers.join(','), ...rows].join('\n');
  }
}
