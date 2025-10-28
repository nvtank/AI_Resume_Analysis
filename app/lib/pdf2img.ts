// ~/lib/pdf2img.ts

/**
 * Result type for PDF → Image conversion
 */
export interface PdfConversionResult {
  imageUrl: string;
  file: File | null;
  error?: string;
}

// We use 'any' here because we are loading the library dynamically.
// The types from @types/pdfjs-dist will still provide editor autocomplete inside the functions.
let pdfjsLib: any = null;
let loadPromise: Promise<any> | null = null;

/**
 * Dynamically load pdfjs-dist and its worker.
 * Ensures the library is only loaded once in the browser.
 */
async function loadPdfJs(): Promise<any> {
  // Return the library if it's already been loaded
  if (pdfjsLib) {
    return pdfjsLib;
  }

  // Return the existing promise if it's currently loading
  if (loadPromise) {
    return loadPromise;
  }

  // Ensure this code runs only in the browser
  if (typeof window === 'undefined') {
    throw new Error('PDF.js can only be used in a browser environment');
  }

  // Start loading the library
  loadPromise = import('pdfjs-dist').then((lib) => {
    // ⚠️ IMPORTANT: Set the worker source.
    // This requires you to copy 'pdf.worker.min.mjs' to your '/public' folder.
    lib.GlobalWorkerOptions.workerSrc = `/pdf.worker.min.mjs`;
    pdfjsLib = lib;
    return lib;
  });

  return loadPromise;
}

/**
 * Convert the first page of a PDF file into a PNG image.
 */
export const convertPdfToImage = async (
  file: File | Blob
): Promise<PdfConversionResult> => {
  try {
    // Dynamically load PDF.js library
    const lib = await loadPdfJs();

    // Convert file/blob → ArrayBuffer for pdf.js
    const arrayBuffer = await file.arrayBuffer();

    // Load PDF document
    const pdf = await lib.getDocument({ data: arrayBuffer }).promise;

    // Get the first page
    const page = await pdf.getPage(1);

    // Set rendering scale for higher quality
    const viewport = page.getViewport({ scale: 2.0 });
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');

    if (!context) {
      throw new Error('Failed to get canvas 2D context');
    }

    // Adjust canvas size to match the page
    canvas.height = viewport.height;
    canvas.width = viewport.width;

    // Render the page to the canvas
    await page.render({ canvasContext: context, viewport: viewport }).promise;

    // Convert canvas to a PNG image Blob
    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob(resolve, 'image/png');
    });

    if (!blob) {
      throw new Error('Failed to create image blob from canvas');
    }

    // Create a URL and a File object from the blob
    const imageUrl = URL.createObjectURL(blob);
    const imageFile = new File([blob], 'resume-preview.png', {
      type: 'image/png',
    });

    return {
      imageUrl,
      file: imageFile,
    };
  } catch (error) {
    console.error('PDF conversion error:', error);
    return {
      imageUrl: '',
      file: null,
      error: `Failed to convert PDF: ${(error as Error).message}`,
    };
  }
};