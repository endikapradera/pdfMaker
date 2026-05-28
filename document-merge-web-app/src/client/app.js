const uploadForm = document.getElementById('uploadForm');
const fileInput = document.getElementById('fileInput');
const fileList = document.getElementById('fileList');
const dropZone = document.getElementById('dropZone');
const message = document.getElementById('message');
const mergeButton = document.getElementById('mergeButton');

let selectedFiles = [];
let dragIndex = null;

const renderFileList = () => {
    fileList.innerHTML = '';

    selectedFiles.forEach((file, index) => {
        const listItem = document.createElement('li');
        listItem.className = 'file-item';
        listItem.draggable = true;
        listItem.dataset.index = String(index);
        listItem.innerHTML = `<span class="file-name">${file.name}</span><span class="file-size">${Math.max(1, Math.round(file.size / 1024))} KB</span>`;

        listItem.addEventListener('dragstart', () => {
            dragIndex = index;
            listItem.classList.add('dragging');
        });

        listItem.addEventListener('dragend', () => {
            dragIndex = null;
            listItem.classList.remove('dragging');
        });

        listItem.addEventListener('dragover', (event) => {
            event.preventDefault();
            listItem.classList.add('over');
        });

        listItem.addEventListener('dragleave', () => {
            listItem.classList.remove('over');
        });

        listItem.addEventListener('drop', (event) => {
            event.preventDefault();
            listItem.classList.remove('over');

            if (dragIndex === null || dragIndex === index) {
                return;
            }

            const moved = selectedFiles.splice(dragIndex, 1)[0];
            selectedFiles.splice(index, 0, moved);
            renderFileList();
        });

        fileList.appendChild(listItem);
    });
};

const appendFiles = (incomingFiles) => {
    const normalized = Array.from(incomingFiles);
    selectedFiles = [...selectedFiles, ...normalized];
    renderFileList();
};

const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            const result = typeof reader.result === 'string' ? reader.result : '';
            const base64 = result.split(',')[1] || '';
            resolve(base64);
        };
        reader.onerror = () => reject(new Error(`No se pudo leer ${file.name}`));
        reader.readAsDataURL(file);
    });
};

const postWithTimeout = async (url, init, timeoutMs) => {
    const controller = new AbortController();
    const timeoutRef = setTimeout(() => controller.abort(), timeoutMs);

    try {
        return await fetch(url, {
            ...init,
            signal: controller.signal,
        });
    } finally {
        clearTimeout(timeoutRef);
    }
};

fileInput.addEventListener('change', () => {
    if (fileInput.files) {
        appendFiles(fileInput.files);
        fileInput.value = '';
    }
});

dropZone.addEventListener('dragover', (event) => {
    event.preventDefault();
    dropZone.classList.add('active');
});

dropZone.addEventListener('dragleave', () => {
    dropZone.classList.remove('active');
});

dropZone.addEventListener('drop', (event) => {
    event.preventDefault();
    dropZone.classList.remove('active');

    if (event.dataTransfer && event.dataTransfer.files && event.dataTransfer.files.length > 0) {
        appendFiles(event.dataTransfer.files);
    }
});

uploadForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    if (selectedFiles.length === 0) {
        message.textContent = 'Selecciona al menos un archivo.';
        message.className = 'message error';
        return;
    }

    message.textContent = 'Uniendo archivos...';
    message.className = 'message loading';
    mergeButton.disabled = true;

    try {
        const payload = {
            files: await Promise.all(
                selectedFiles.map(async (file) => ({
                    name: file.name,
                    mimeType: file.type || 'application/octet-stream',
                    dataBase64: await fileToBase64(file),
                }))
            ),
        };

        const response = await postWithTimeout('/api/merge', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        }, 120000);

        if (!response.ok) {
            const errorResponse = await response.json().catch(() => ({}));
            const errorMessage = errorResponse.message || 'No se pudo unir los archivos.';
            throw new Error(errorMessage);
        }

        const mergedPdfBlob = await response.blob();
        const downloadUrl = URL.createObjectURL(mergedPdfBlob);
        const anchor = document.createElement('a');
        anchor.href = downloadUrl;
        anchor.download = 'documento-unido.pdf';
        document.body.appendChild(anchor);
        anchor.click();
        anchor.remove();
        URL.revokeObjectURL(downloadUrl);

        message.textContent = 'PDF generado con exito. Descarga iniciada.';
        message.className = 'message success';
        selectedFiles = [];
        renderFileList();
    } catch (error) {
        const text = error instanceof Error && error.name === 'AbortError'
            ? 'La operacion tardo demasiado. Prueba con menos archivos.'
            : error instanceof Error
                ? error.message
                : 'Error inesperado.';
        message.textContent = text;
        message.className = 'message error';
    } finally {
        mergeButton.disabled = false;
    }
});
