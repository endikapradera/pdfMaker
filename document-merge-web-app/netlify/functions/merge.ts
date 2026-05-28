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

const readContentType = (headers: Record<string, string | undefined>): string => {
    return headers['content-type'] || headers['Content-Type'] || '';
};

const parseJsonPayload = (event: Parameters<Handler>[0]): UploadedDocument[] => {
    if (!event.body) {
        return [];
    }

    const raw = event.isBase64Encoded
        ? Buffer.from(event.body, 'base64').toString('utf-8')
        : event.body;

    const payload = JSON.parse(raw) as {
        files?: Array<{
            name: string;
            mimeType: string;
            dataBase64: string;
        }>;
    };

    return (payload.files || []).map((file) => ({
        originalname: file.name,
        mimetype: file.mimeType,
        data: Buffer.from(file.dataBase64, 'base64'),
    }));
};

const parseMultipartPayload = async (event: Parameters<Handler>[0]): Promise<UploadedDocument[]> => {
    const normalizedEvent = {
        ...event,
        headers: {
            ...(event.headers || {}),
            'content-type': readContentType(event.headers || {}),
        },
    };

    const parsed = await multipart.parse(normalizedEvent as any);

    return (parsed.files || []).map<UploadedDocument>((file) => ({
        originalname: file.filename,
        mimetype: file.contentType || 'application/octet-stream',
        data: Buffer.isBuffer(file.content) ? file.content : Buffer.from(file.content, 'binary'),
    }));
};

const withTimeout = async <T>(promise: Promise<T>, milliseconds: number, label: string): Promise<T> => {
    let timeoutRef: NodeJS.Timeout | undefined;

    try {
        const timeoutPromise = new Promise<T>((_resolve, reject) => {
            timeoutRef = setTimeout(() => {
                reject(new Error(`Tiempo agotado procesando ${label}.`));
            }, milliseconds);
        });

        return await Promise.race([promise, timeoutPromise]);
    } finally {
        if (timeoutRef) {
            clearTimeout(timeoutRef);
        }
    }
};

export const handler: Handler = async (event) => {
    if (event.httpMethod !== 'POST') {
        return jsonResponse(405, 'Metodo no permitido.', { Allow: 'POST' });
    }

    try {
        const contentType = readContentType(event.headers || {});
        const files = contentType.includes('application/json')
            ? parseJsonPayload(event)
            : await parseMultipartPayload(event);

        if (files.length === 0) {
            return jsonResponse(400, 'Debes subir al menos un archivo.');
        }

        const pdfBuffers = await Promise.all(
            files.map((file) => withTimeout(
                convertService.convertToPDF(file),
                30000,
                file.originalname
            ))
        );
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
