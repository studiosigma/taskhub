import { IsString, IsNotEmpty, IsNumber, IsOptional, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateTaskDto {
  @ApiProperty({ example: 'Butuh bantuan pindahan rumah' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: 'Saya butuh 2 orang untuk bantu pindah furniture...' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ example: 150000 })
  @IsNumber()
  @Min(1000)
  budget: number;

  @ApiProperty({ example: '3 jam' })
  @IsString()
  @IsNotEmpty()
  duration: string;

  @ApiProperty({ example: 2 })
  @IsNumber()
  @Min(1)
  @Max(10)
  helperNeeded: number;

  @ApiProperty({ example: 'uuid-category-id' })
  @IsString()
  @IsNotEmpty()
  categoryId: string;

  @ApiPropertyOptional({ example: -6.2088 })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  latitude?: number;

  @ApiPropertyOptional({ example: 106.8456 })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  longitude?: number;

  @ApiPropertyOptional({ example: 'Jl. Merdeka No. 1, Jakarta' })
  @IsString()
  @IsOptional()
  address?: string;
}
