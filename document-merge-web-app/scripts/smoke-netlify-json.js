const { handler } = require('../dist/netlify/functions/merge.js');

(async () => {
    const payload = {
        files: [
            {
                name: 'uno.txt',
                mimeType: 'text/plain',
                dataBase64: Buffer.from('Primer documento de prueba', 'utf8').toString('base64'),
            },
            {
                name: 'dos.txt',
                mimeType: 'text/plain',
                dataBase64: Buffer.from('Segundo documento de prueba', 'utf8').toString('base64'),
            },
        ],
    };

    const response = await handler({
        httpMethod: 'POST',
        headers: {
            'content-type': 'application/json',
        },
        body: JSON.stringify(payload),
        isBase64Encoded: false,
    });

    if (!response || response.statusCode !== 200) {
        throw new Error(`Unexpected status: ${response ? response.statusCode : 'no response'} ${response ? response.body : ''}`);
    }

    const pdfBuffer = Buffer.from(response.body, 'base64');
    const pdfHeader = pdfBuffer.subarray(0, 4).toString('utf8');

    if (pdfHeader !== '%PDF') {
        throw new Error('JSON flow did not return a valid PDF payload.');
    }

    console.log('NETLIFY_JSON_FLOW_OK');
})();
