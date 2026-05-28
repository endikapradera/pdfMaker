import { Request, Response } from 'express';
import fs from 'fs/promises';
import { MergeService } from '../services/mergeService';
import { ConvertService } from '../services/convertService';

export class MergeController {
    private mergeService: MergeService;
    private convertService: ConvertService;

    constructor() {
        this.mergeService = new MergeService();
        this.convertService = new ConvertService();
    }

    public mergeDocuments = async (req: Request, res: Response) => {
        const files = (req.files as Express.Multer.File[]) || [];

        try {
            if (files.length === 0) {
                res.status(400).json({ message: 'Debes subir al menos un archivo.' });
                return;
            }

            const pdfBuffers = await Promise.all(
                files.map((file) => this.convertService.convertToPDF(file))
            );

            const mergedPdf = await this.mergeService.mergePDFs(pdfBuffers);

            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', 'attachment; filename="documento-unido.pdf"');
            res.status(200).send(Buffer.from(mergedPdf));
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Error inesperado';
            res.status(500).json({ message: `Error al unir documentos: ${message}` });
        } finally {
            await Promise.all(
                files.map(async (file) => {
                    try {
                        await fs.unlink(file.path);
                    } catch {
                        // Ignore cleanup errors.
                    }
                })
            );
        }
    };
}