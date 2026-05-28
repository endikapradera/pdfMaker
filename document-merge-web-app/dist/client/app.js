"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const uploadForm = document.getElementById('uploadForm');
const fileInput = document.getElementById('fileInput');
const fileList = document.getElementById('fileList');
const dropZone = document.getElementById('dropZone');
const message = document.getElementById('message');
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
            const [movedItem] = selectedFiles.splice(dragIndex, 1);
            selectedFiles.splice(index, 0, movedItem);
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
    var _a;
    event.preventDefault();
    dropZone.classList.remove('active');
    if (((_a = event.dataTransfer) === null || _a === void 0 ? void 0 : _a.files) && event.dataTransfer.files.length > 0) {
        appendFiles(event.dataTransfer.files);
    }
});
uploadForm.addEventListener('submit', (event) => __awaiter(void 0, void 0, void 0, function* () {
    event.preventDefault();
    if (selectedFiles.length === 0) {
        message.textContent = 'Selecciona al menos un archivo.';
        message.className = 'message error';
        return;
    }
    const formData = new FormData();
    selectedFiles.forEach((file) => formData.append('files', file));
    message.textContent = 'Uniendo archivos...';
    message.className = 'message loading';
    try {
        const response = yield fetch('/api/merge', {
            method: 'POST',
            body: formData,
        });
        if (!response.ok) {
            const errorResponse = yield response.json().catch(() => ({}));
            const errorMessage = errorResponse.message || 'No se pudo unir los archivos.';
            throw new Error(errorMessage);
        }
        const mergedPdfBlob = yield response.blob();
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
    }
    catch (error) {
        const text = error instanceof Error ? error.message : 'Error inesperado.';
        message.textContent = text;
        message.className = 'message error';
    }
}));
