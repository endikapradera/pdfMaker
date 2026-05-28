declare module 'lambda-multipart-parser' {
    import { HandlerEvent } from '@netlify/functions';

    export interface ParsedMultipartFile {
        filename: string;
        contentType: string;
        content: Buffer | string;
        fieldname: string;
    }

    export interface ParsedMultipartResult {
        files?: ParsedMultipartFile[];
    }

    const parser: {
        parse(event: HandlerEvent): Promise<ParsedMultipartResult>;
    };

    export default parser;
}
