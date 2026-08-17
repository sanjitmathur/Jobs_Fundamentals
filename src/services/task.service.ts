import { Prisma, TaskStatus } from '@prisma/client';
import { prisma } from '../utils/db';

export async function createTask(data: { title: string; description?: string }) {
  return prisma.task.create({ data });
}

export async function getTaskById(id: string) {
  return prisma.task.findUnique({ where: { id } });
}

export async function updateTask(id: string, data: { title?: string; description?: string }) {
  return prisma.task.update({ where: { id }, data });
}

export async function updateTaskStatus(id: string, status: TaskStatus) {
  return prisma.task.update({ where: { id }, data: { status } });
}

export async function getTasks(options: { status?: string; page?: number; limit?: number }) {
  const page = options.page && options.page > 0 ? options.page : 1;
  const limit = options.limit && options.limit > 0 ? options.limit : 10;
  const skip = (page - 1) * limit;

  const where: Prisma.TaskWhereInput = {};

  if (options.status && Object.values(TaskStatus).includes(options.status as TaskStatus)) {
    where.status = options.status as TaskStatus;
  }

  console.log('GET_TASKS_WHERE', JSON.stringify(where, null, 2));
  console.log('GET_TASKS_PAGE_LIMIT_SKIP', { page, limit, skip });

  const tasks = await prisma.task.findMany({
    where,
    skip,
    take: limit,
  });

  const total = await prisma.task.count({ where });

  return {
    data: tasks,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
}
