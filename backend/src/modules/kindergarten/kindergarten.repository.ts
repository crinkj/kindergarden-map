import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { SearchKindergartenDto } from './dto/search-kindergarten.dto';

@Injectable()
export class KindergartenRepository {
  constructor(private readonly prisma: PrismaService) {}

  buildWhereClause(dto: SearchKindergartenDto): Prisma.KindergartenWhereInput {
    const where: Prisma.KindergartenWhereInput = {};

    // Bounds query (viewport-based)
    if (
      dto.swLat !== undefined &&
      dto.swLng !== undefined &&
      dto.neLat !== undefined &&
      dto.neLng !== undefined
    ) {
      where.lttdcdnt = { gte: dto.swLat, lte: dto.neLat };
      where.lngtcdnt = { gte: dto.swLng, lte: dto.neLng };
    }

    // Keyword search
    if (dto.keyword) {
      where.kindername = { contains: dto.keyword, mode: 'insensitive' };
    }

    // Region filters
    if (dto.sidoCode) {
      where.sidoCode = dto.sidoCode;
    }

    if (dto.sggCode) {
      where.sggCode = dto.sggCode;
    }

    // Establishment type filter
    if (dto.establish) {
      where.establish = dto.establish;
    }

    return where;
  }

  async findAll(dto: SearchKindergartenDto): Promise<{
    items: Awaited<ReturnType<typeof this.prisma.kindergarten.findMany>>;
    total: number;
  }> {
    const where = this.buildWhereClause(dto);
    const page = dto.page ?? 1;
    const limit = dto.limit ?? 100;
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      this.prisma.kindergarten.findMany({
        where,
        skip,
        take: limit,
        orderBy: { kindername: 'asc' },
      }),
      this.prisma.kindergarten.count({ where }),
    ]);

    return { items, total };
  }

  async findAllForCsv(
    dto: SearchKindergartenDto,
  ): Promise<Awaited<ReturnType<typeof this.prisma.kindergarten.findMany>>> {
    const where = this.buildWhereClause(dto);
    return this.prisma.kindergarten.findMany({
      where,
      orderBy: { kindername: 'asc' },
    });
  }

  async findByKinderCode(
    kinderCode: string,
  ): Promise<Awaited<ReturnType<typeof this.prisma.kindergarten.findUnique>>> {
    return this.prisma.kindergarten.findUnique({ where: { kinderCode } });
  }
}
