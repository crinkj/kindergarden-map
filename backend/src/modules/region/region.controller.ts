import { Controller, Get, Query } from '@nestjs/common';
import { RegionService } from './region.service';

@Controller('api/regions')
export class RegionController {
  constructor(private readonly regionService: RegionService) {}

  @Get('sido')
  getSido(): { data: { code: string; name: string }[] } {
    return { data: this.regionService.getSidoList() };
  }

  @Get('stats')
  async getStats(
    @Query('sidoCode') sidoCode?: string,
    @Query('type') type?: string,
  ): Promise<{ data: { code: string; name: string; count: number; totalChildren: number }[] }> {
    const data = await this.regionService.getStats(sidoCode, type);
    return { data };
  }

  @Get('sgg')
  async getSgg(
    @Query('sidoCode') sidoCode: string,
  ): Promise<{ data: { sidoCode: string; sggCode: string; name: string }[] }> {
    const data = await this.regionService.getSggList(sidoCode);
    return { data };
  }
}
