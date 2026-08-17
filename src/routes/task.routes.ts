import { Router } from 'express';
import { TaskController } from '../controllers/task.controller';
import { validate } from '../middlewares/validate';
import { createTaskSchema, updateTaskSchema, updateTaskStatusSchema } from '../schemas/task.schema';

const router = Router();

router.post('/', validate(createTaskSchema), TaskController.create);
router.get('/', TaskController.list);
router.get('/:id', TaskController.getOne);
router.patch('/:id', validate(updateTaskSchema), TaskController.update);
router.patch('/:id/status', validate(updateTaskStatusSchema), TaskController.updateStatus);

export default router;
