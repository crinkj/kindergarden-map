import { Controller, Get, Param, Query, Res } from '@nestjs/common';
import { Response } from 'express';
import { ChildcareService } from './childcare.service';
import { SearchChildcareDto } from './dto/search-childcare.dto';

@Controller('api/childcares')
export class ChildcareController {
  constructor(private readonly service: ChildcareService) {}

  @Get()
  async search(
    @Query() dto: SearchChildcareDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    if (dto.format === 'csv') {
      const csv = await this.service.findAllAsCsv(dto);
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', 'attachment; filename="childcares.csv"');
      res.send('\uFEFF' + csv);
      return;
    }
    return this.service.search(dto);
  }

  @Get(':stcode')
  async getDetail(@Param('stcode') stcode: string) {
    return this.service.getDetail(stcode);
  }
}
