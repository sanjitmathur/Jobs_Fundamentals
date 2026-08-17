import { Request, Response, NextFunction } from 'express';
import * as TaskService from '../services/task.service';

export const create = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const task = await TaskService.createTask(req.body);
    res.status(201).json(task);
  } catch (error) {
    next(error);
  }
};

export const list = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status, page, limit } = req.query as { status?: string; page?: string; limit?: string };

    const tasks = await TaskService.getTasks({
      status: status,
      page: page ? parseInt(page) : undefined,
      limit: limit ? parseInt(limit) : undefined,
    });

    res.status(200).json(tasks);
  } catch (error) {
    next(error);
  }
};

export const getOne = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const task = await TaskService.getTaskById(req.params.id as string);
    if (!task) {
      res.status(404).json({ message: 'Task not found' });
      return;
    }
    res.status(200).json(task);
  } catch (error) {
    next(error);
  }
};

export const update = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const task = await TaskService.updateTask(req.params.id as string, req.body);
    res.status(200).json(task);
  } catch (error) {
    next(error);
  }
};

export const updateStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status } = req.body as { status: string };
    const task = await TaskService.updateTaskStatus(req.params.id as string, status as any);
    res.status(200).json(task);
  } catch (error) {
    next(error);
  }
};

export const TaskController = {
  create,
  list,
  getOne,
  update,
  updateStatus,
};
