import * as pdfjsLib from 'pdfjs-dist';

// Use CDN for worker to avoid local pathing issues on Android/Acode
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;

export const extractPdfText = async (file: File, onProgress: (p: number) => void): Promise<string[]> => {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    
    const pdf = await loadingTask.promise;
    const numPages = pdf.numPages;
    let fullText: string[] = [];

    for (let i = 1; i <= numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      
      // Sort items by Y (top to bottom) then X (left to right)
      // This helps handle multi-column layouts by flattening them into a flow
      const items = content.items as any[];
      const pageStrings = items
        .sort((a, b) => {
          // Vertical check (inverted coordinate system in PDF.js)
          const yDiff = b.transform[5] - a.transform[5];
          if (Math.abs(yDiff) > 5) return yDiff;
          // Horizontal check
          return a.transform[4] - b.transform[4];
        })
        .map(item => item.str);
      
      fullText.push(pageStrings.join(' '));
      onProgress(Math.round((i / numPages) * 100));
    }
    
    return fullText;
  } catch (error) {
    console.error("Error processing PDF:", error);
    throw new Error("Failed to process PDF file. It might be corrupted or protected.");
  }
};
