import { Router } from 'express';
import multer from 'multer';
import { MergeController } from '../controllers/mergeController';

const router = Router();
const mergeController = new MergeController();
const upload = multer({ dest: 'uploads/' });

router.post('/', upload.array('files', 50), mergeController.mergeDocuments.bind(mergeController));

export function setMergeRoutes(app: any): void {
    app.use('/api/merge', router);
}