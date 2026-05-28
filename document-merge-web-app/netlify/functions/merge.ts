import { Handler, HandlerResponse } from '@netlify/functions';
import multipart from 'lambda-multipart-parser';
import { ConvertService, UploadedDocument } from '../../src/server/services/convertService';
import { MergeService } from '../../src/server/services/mergeService';

const convertService = new ConvertService();
const mergeService = new MergeService();

const jsonResponse = (statusCode: number, message: string, extraHeaders: Record<string, string> = {}): HandlerResponse => ({
    statusCode,
    headers: {
        'Content-Type': 'application/json',
        ...extraHeaders,
    },
    body: JSON.stringify({ message }),
});

export const handler: Handler = async (event) => {
    if (event.httpMethod !== 'POST') {
        return jsonResponse(405, 'Metodo no permitido.', { Allow: 'POST' });
    }

    try {
        const parsed = await multipart.parse(event);
        const files = (parsed.files || []).map<UploadedDocument>((file) => ({
            originalname: file.filename,
            mimetype: file.contentType,
            data: Buffer.isBuffer(file.content) ? file.content : Buffer.from(file.content, 'binary'),
        }));

        if (files.length === 0) {
            return jsonResponse(400, 'Debes subir al menos un archivo.');
        }

        const pdfBuffers = await Promise.all(files.map((file) => convertService.convertToPDF(file)));
        const mergedPdf = await mergeService.mergePDFs(pdfBuffers);

        return {
            statusCode: 200,
            isBase64Encoded: true,
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': 'attachment; filename="documento-unido.pdf"',
                'Cache-Control': 'no-store',
            },
            body: Buffer.from(mergedPdf).toString('base64'),
        };
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Error inesperado';
        return jsonResponse(500, `Error al unir documentos: ${message}`);
    }
};
