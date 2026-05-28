const { handler } = require('../dist/netlify/functions/merge.js');

const boundary = '----netlify-test-boundary';
const textFileContent = 'Hola desde la prueba de Netlify Function';
const multipartBody = [
    `--${boundary}`,
    'Content-Disposition: form-data; name="files"; filename="prueba.txt"',
    'Content-Type: text/plain',
    '',
    textFileContent,
    `--${boundary}--`,
    '',
].join('\r\n');

(async () => {
    const response = await handler({
        httpMethod: 'POST',
        headers: {
            'content-type': `multipart/form-data; boundary=${boundary}`,
        },
        body: Buffer.from(multipartBody, 'utf8').toString('base64'),
        isBase64Encoded: true,
    });

    if (!response || response.statusCode !== 200) {
        throw new Error(`Unexpected status: ${response ? response.statusCode : 'no response'} ${response ? response.body : ''}`);
    }

    const pdfBuffer = Buffer.from(response.body, 'base64');
    const pdfHeader = pdfBuffer.subarray(0, 4).toString('utf8');

    if (pdfHeader !== '%PDF') {
        throw new Error('Function response is not a valid PDF payload.');
    }

    console.log('NETLIFY_FUNCTION_SMOKE_OK');
})();
