# PDF Maker - Fusionador de Documentos a PDF

Aplicacion web de una sola pagina para unir multiples archivos en un unico PDF.

Permite subir archivos de distintos formatos, convertirlos a PDF cuando hace falta, ordenar el contenido antes de unir y descargar el documento final al instante.

Hecho por ENDIKA PRADERA.

## Demo local

1. Instala dependencias:

```bash
npm install
```

2. Ejecuta en desarrollo:

```bash
npm run dev
```

3. Abre en navegador:

```text
http://localhost:3000
```

## Funcionalidades

- Single page UI basica y bonita.
- Subida multiple de archivos.
- Soporte drag and drop (arrastrar y soltar).
- Reordenar archivos antes de fusionar.
- Conversion automatica segun tipo de archivo.
- Descarga automatica del PDF final.
- Limpieza de archivos temporales en servidor.

## Formatos soportados

- PDF: .pdf
- Imagenes: .jpg, .jpeg, .png, .webp, .gif
- Texto plano: .txt
- Word: .doc, .docx

Notas de conversion:

- .docx y .doc se convierten extrayendo texto y renderizandolo en PDF.
- .webp y .gif se convierten primero a PNG para incrustarlos en PDF.

## Flujo de uso

1. Selecciona archivos o arrastralos a la zona de carga.
2. Reordena los elementos de la lista si quieres cambiar el orden final.
3. Pulsa Unir y Descargar PDF.
4. El navegador descarga documento-unido.pdf.

## Estructura del proyecto

```text
document-merge-web-app
|-- package.json
|-- tsconfig.json
|-- src
|   |-- client
|   |   |-- index.html
|   |   |-- styles.css
|   |   |-- app.js
|   |   `-- app.ts
|   `-- server
|       |-- app.ts
|       |-- controllers
|       |   `-- mergeController.ts
|       |-- routes
|       |   `-- mergeRoutes.ts
|       `-- services
|           |-- convertService.ts
|           `-- mergeService.ts
`-- uploads
```

## Scripts disponibles

```bash
npm run dev      # servidor con recarga
npm run build    # compila TypeScript
npm start        # arranca servidor
```

## API

### POST /api/merge

Endpoint para fusionar archivos en un PDF unico.

Request:

- Content-Type: multipart/form-data
- Campo: files (multiple)

Response exitosa:

- Content-Type: application/pdf
- Descarga directa con nombre documento-unido.pdf

Errores comunes:

- 400 si no envias archivos.
- 500 si algun archivo no se puede convertir.

## Despliegue rapido (Render/Railway)

Configuracion recomendada:

- Build Command: npm install ; npm run build
- Start Command: npm start
- Node version: 18 o superior

Variables de entorno opcionales:

- PORT (la plataforma la inyecta normalmente)

## Troubleshooting

- Si falla un archivo Word antiguo (.doc), prueba guardarlo como .docx.
- Si una imagen no abre, conviertela a JPG/PNG y vuelve a subirla.
- Si no descarga, revisa bloqueadores del navegador para descargas automaticas.

## Stack tecnico

- Node.js
- Express
- TypeScript
- Multer
- pdf-lib
- Mammoth
- word-extractor
- sharp

## Licencia

MIT
