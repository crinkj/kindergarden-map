import { Controller, Get, Param, Query, Res } from '@nestjs/common';
import { Response } from 'express';
import { KindergartenService } from './kindergarten.service';
import { SearchKindergartenDto } from './dto/search-kindergarten.dto';
import {
  KindergartenDetailDto,
  KindergartenListResponseDto,
} from './dto/kindergarten-response.dto';

@Controller('api/kindergartens')
export class KindergartenController {
  constructor(private readonly kindergartenService: KindergartenService) {}

  @Get()
  async findAll(
    @Query() dto: SearchKindergartenDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<KindergartenListResponseDto | void> {
    if (dto.format === 'csv') {
      const csv = await this.kindergartenService.findAllAsCsv(dto);
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', 'attachment; filename="kindergartens.csv"');
      res.send('\uFEFF' + csv);
      return;
    }

    return this.kindergartenService.findAll(dto);
  }

  @Get(':kinderCode')
  async findOne(@Param('kinderCode') kinderCode: string): Promise<KindergartenDetailDto> {
    return this.kindergartenService.findByKinderCode(kinderCode);
  }
}
