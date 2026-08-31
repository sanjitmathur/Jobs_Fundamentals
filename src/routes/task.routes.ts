import { Router } from 'express';
import { TaskController } from '../controllers/task.controller';
import { validate } from '../middlewares/validate';
import { authenticate } from '../middlewares/authenticate';
import { createTaskSchema, updateTaskSchema, updateTaskStatusSchema } from '../schemas/task.schema';

const router = Router();

router.use(authenticate);

router.post('/', validate(createTaskSchema), TaskController.create);
router.get('/', TaskController.list);
router.get('/:id', TaskController.getOne);
router.patch('/:id', validate(updateTaskSchema), TaskController.update);
router.patch('/:id/status', validate(updateTaskStatusSchema), TaskController.updateStatus);
router.delete('/:id', TaskController.remove);

export default router;
