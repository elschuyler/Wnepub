# PDF to EPUB PWA

https://elschuyler.github.io/Wnepub/

A fast, private, and localized Progressive Web App (PWA) to convert PDF files into EPUB format. This application is optimized for mobile development environments like Acode, ensuring smooth operation even in limited webview contexts.

## Features
- **Client-Side Processing**: No data ever leaves your device. Conversion happens entirely in the browser.
- **Improved Flow**: Automatically detects multi-column layouts and flattens them for better reading on mobile screens.
- **Acode Compatible**: Pre-configured to run on `0.0.0.0` for easy access over a local network/mobile browser.
- **Robust Tech**: Powered by React, PDF.js, and JSZip.

## Prerequisites
- Node.js (v18 or newer recommended)
- npm (installed with Node.js)

## Installation

1.  Clone the project or copy the files into your local directory.
2.  Open your terminal in the project root.
3.  Install dependencies:
    `npm install`

## How to Run

### Development Mode
To run the server and access it from your device or other devices on the same network:
`npm run dev`

By default, the server will list local IP addresses (e.g., `http://192.168.1.50:5173`). Open this URL in your mobile browser to use the app.

### Production Build
To create a production-ready folder:
`npm run build`
The output will be in the `/dist` folder.

## Troubleshooting

### Blank Screen in Acode
If you see a blank screen when running the preview in Acode:
1. Ensure you have run `npm install`.
2. Check that the port `5173` is not blocked by your device firewall.
3. Access the application using your phone's local network IP shown in the terminal, not `localhost`.

### PDF Worker Errors
The application uses a CDN for the PDF.js worker:
`https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`
Ensure you have an active internet connection on your device when running the app for the first time so the worker can load.

## Project Structure
- `src/App.tsx`: The main UI and conversion logic orchestrator.
- `src/utils/pdfProcessor.ts`: Handles reading PDF data and extracting text strings sorted by coordinates.
- `src/utils/epubGenerator.ts`: Handles the creation of the EPUB container and internal file structure (XHTML, OPF, NCX).
- `package.json`: Project configuration and dependencies.
- `vite.config.ts`: Configured for mobile network access.
