import { IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class SearchKindergartenDto {
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  swLat?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  swLng?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  neLat?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  neLng?: number;

  @IsOptional()
  @IsString()
  keyword?: string;

  @IsOptional()
  @IsString()
  sidoCode?: string;

  @IsOptional()
  @IsString()
  sggCode?: string;

  @IsOptional()
  @IsString()
  establish?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(500)
  limit?: number = 100;

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
  @IsString()
  sortBy?: string;

  @IsOptional()
  @IsString()
  format?: string;
}
