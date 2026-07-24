import { PaginationQueryDto, PaginatedResult } from '../dto/pagination.dto.js';

export async function paginate<T>(
  model: any,
  paginationDto: PaginationQueryDto,
  args: any = {},
): Promise<PaginatedResult<T>> {
  const page = Number(paginationDto.page) || 1;
  const limit = Number(paginationDto.limit) || 10;
  const skip = (page - 1) * limit;

  const [data, total] = await Promise.all([
    model.findMany({ ...args, skip, take: limit }),
    model.count({ where: args.where }),
  ]);

  return {
    data,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
}
