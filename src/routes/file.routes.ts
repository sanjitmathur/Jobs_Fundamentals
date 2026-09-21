import { Router } from 'express';
import { FileController } from '../controllers/file.controller';
import { singleUpload, multipleUpload } from '../middlewares/upload';
import { validate } from '../middlewares/validate';
import { taskIdParamSchema, fileIdParamSchema } from '../schemas/file.schema';

const router = Router({ mergeParams: true });

router.post('/', validate(taskIdParamSchema), singleUpload, FileController.upload);
router.post('/batch', validate(taskIdParamSchema), multipleUpload, FileController.uploadMultiple);
router.get('/', validate(taskIdParamSchema), FileController.list);
router.get('/:fileId', validate(fileIdParamSchema), FileController.getOne);
router.get('/:fileId/download', validate(fileIdParamSchema), FileController.download);
router.delete('/:fileId', validate(fileIdParamSchema), FileController.remove);

export default router;
