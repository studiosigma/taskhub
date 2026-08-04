import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { tasksApi, categoriesApi } from '../services';
import { Task, Category } from '../types';

const TASKS_LIMIT = 10;

interface InfiniteTasksResponse {
  data: Task[];
  meta: {
    page: number;
    limit: number;
    total: number;
    hasNextPage: boolean;
  };
}

export const useTasks = (
  params: {
    categoryId?: string;
    search?: string;
    status?: string;
  } = {}
) => {
  return useInfiniteQuery<InfiniteTasksResponse>({
    queryKey: ['tasks', params],
    queryFn: async ({ pageParam = 1 }): Promise<InfiniteTasksResponse> => {
      const response = await tasksApi.getAll({
        ...params,
        page: pageParam,
        limit: TASKS_LIMIT,
      }) as Task[];
      // response is Task[] (flat array)
      const tasks = response;
      return {
        data: tasks,
        meta: {
          page: pageParam as number,
          limit: TASKS_LIMIT,
          total: tasks.length,
          hasNextPage: tasks.length >= TASKS_LIMIT,
        },
      };
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (!lastPage.meta.hasNextPage) {
        return undefined;
      }
      return lastPage.meta.page + 1;
    },
  });
};

export const useTask = (id: string) => {
  return useQuery<Task>({
    queryKey: ['task', id],
    queryFn: () => tasksApi.getById(id),
    enabled: !!id,
  });
};

export const useMyTasks = (params: { page?: number; limit?: number } = {}) => {
  return useQuery<Task[]>({
    queryKey: ['myTasks', params],
    queryFn: () => tasksApi.getMyTasks(),
  });
};

export const useMyApplications = (params: { page?: number; limit?: number } = {}) => {
  return useQuery<Task[]>({
    queryKey: ['myApplications', params],
    queryFn: () => tasksApi.getMyApplications(),
  });
};

export const useCategories = () => {
  return useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: () => categoriesApi.getAll(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};