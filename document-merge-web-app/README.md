# Document Merge Web App

This project is a web application that allows users to upload different document types and merge them into a single PDF. The app includes a simple, responsive single-page interface.

## Features

- Upload multiple documents in one action.
- Convert and merge into one final PDF.
- Download starts automatically when merge is done.
- Drag and drop support for quick upload.
- Reorder files in the list before merging.
- Responsive single-page interface.

## Project Structure

```
document-merge-web-app
├── src
│   ├── server
│   │   ├── app.ts                  # Entry point of the server application
│   │   ├── controllers
│   │   │   └── mergeController.ts   # Handles file uploads and merging documents
│   │   ├── routes
│   │   │   └── mergeRoutes.ts       # Sets up routes for document merging
│   │   ├── services
│   │   │   ├── convertService.ts    # Converts various file types for merging
│   │   │   └── mergeService.ts      # Merges multiple PDFs into a single PDF
│   │   └── types
│   │       └── index.ts             # Defines request and response object structures
│   └── client
│       ├── index.html               # Main HTML file for the client-side application
│       ├── app.ts                   # Client-side JavaScript for handling user interactions
│       └── styles.css               # CSS styles for the client-side application
├── package.json                     # npm configuration file
├── tsconfig.json                    # TypeScript configuration file
└── README.md                        # Project documentation
```

## Installation

1. Clone the repository:
   ```
   git clone <repository-url>
   cd document-merge-web-app
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the server:
   ```
   npm start
   ```

4. Open your browser and navigate to `http://localhost:3000`.

## Usage

- Select one or more files in the web form.
- Click "Unir y Descargar PDF".
- The app uploads files, converts them to PDF when needed, merges all pages, and downloads `documento-unido.pdf`.

## Supported Input Formats

- PDF (`.pdf`)
- Images (`.jpg`, `.jpeg`, `.png`)
- Images (`.webp`, `.gif`) converted to PDF through PNG fallback
- Plain text (`.txt`)
- Word (`.doc`, `.docx`)

Notes:
- `.docx` and `.doc` are converted by extracting text content and rendering that text into PDF pages.
- For images, conversion currently supports JPG/JPEG/PNG.

## Technologies Used

- Node.js
- Express
- TypeScript
- HTML/CSS
- JavaScript

## Contributing

Contributions are welcome! Please open an issue or submit a pull request for any improvements or bug fixes.

## License

This project is licensed under the MIT License. See the LICENSE file for details.