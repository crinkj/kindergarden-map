import { IsOptional, IsString, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class SearchChildcareDto {
  @IsOptional()
  @IsString()
  format?: string;

  @IsOptional()
  @IsString()
  keyword?: string;

  @IsOptional()
  @IsString()
  arcode?: string; // 5-digit sgg code

  @IsOptional()
  @IsString()
  crtype?: string; // 국공립, 민간, 가정, etc.

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minChildren?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  maxChildren?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  swLat?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  swLng?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  neLat?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  neLng?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit?: number;
}
