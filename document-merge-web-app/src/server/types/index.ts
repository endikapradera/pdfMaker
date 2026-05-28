export interface FileUploadRequest {
    files: Array<{
        fieldname: string;
        originalname: string;
        encoding: string;
        mimetype: string;
        buffer: Buffer;
        size: number;
    }>;
}

export interface MergeResponse {
    success: boolean;
    message: string;
    mergedFileUrl?: string;
}