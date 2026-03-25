import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { SearchChildcareDto } from './dto/search-childcare.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class ChildcareRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findMany(dto: SearchChildcareDto) {
    const page = dto.page ?? 1;
    const limit = dto.limit ?? 100;
    const skip = (page - 1) * limit;

    const where: Prisma.ChildcareWhereInput = {
      crstatusname: { not: '폐지' },
    };

    if (dto.keyword) {
      where.OR = [
        { crname: { contains: dto.keyword, mode: 'insensitive' } },
        { craddr: { contains: dto.keyword, mode: 'insensitive' } },
      ];
    }

    if (dto.arcode) {
      // 5자리 sgg 코드면 exact match, 2자리 sido 코드면 prefix match
      where.arcode = dto.arcode.length <= 2
        ? { startsWith: dto.arcode }
        : dto.arcode;
    }

    if (dto.crtype) {
      where.crtypename = { contains: dto.crtype, mode: 'insensitive' };
    }

    if (dto.minChildren !== undefined || dto.maxChildren !== undefined) {
      where.crchcnt = {
        ...(dto.minChildren !== undefined ? { gte: dto.minChildren } : {}),
        ...(dto.maxChildren !== undefined ? { lte: dto.maxChildren } : {}),
      };
    }

    const hasBounds =
      dto.swLat !== undefined &&
      dto.swLng !== undefined &&
      dto.neLat !== undefined &&
      dto.neLng !== undefined;

    if (hasBounds && !dto.arcode) {
      where.la = { gte: dto.swLat, lte: dto.neLat };
      where.lo = { gte: dto.swLng, lte: dto.neLng };
    }

    const [items, total] = await Promise.all([
      this.prisma.childcare.findMany({
        where,
        skip,
        take: limit,
        orderBy: { crname: 'asc' },
        select: {
          stcode: true,
          crname: true,
          crtypename: true,
          crstatusname: true,
          craddr: true,
          crtelno: true,
          crhome: true,
          crcapat: true,
          crchcnt: true,
          la: true,
          lo: true,
          arcode: true,
          sidoname: true,
          sigunguname: true,
          updatedAt: true,
        },
      }),
      this.prisma.childcare.count({ where }),
    ]);

    return { items, total };
  }

  async findAllForCsv(dto: SearchChildcareDto) {
    const where: Prisma.ChildcareWhereInput = {
      crstatusname: { not: '폐지' },
    };

    if (dto.keyword) {
      where.OR = [
        { crname: { contains: dto.keyword, mode: 'insensitive' } },
        { craddr: { contains: dto.keyword, mode: 'insensitive' } },
      ];
    }

    if (dto.arcode) {
      where.arcode = dto.arcode.length <= 2
        ? { startsWith: dto.arcode }
        : dto.arcode;
    }

    if (dto.crtype) {
      where.crtypename = { contains: dto.crtype, mode: 'insensitive' };
    }

    return this.prisma.childcare.findMany({
      where,
      orderBy: { crname: 'asc' },
      take: 5000,
    });
  }

  async findOne(stcode: string) {
    return this.prisma.childcare.findUnique({ where: { stcode } });
  }
}
