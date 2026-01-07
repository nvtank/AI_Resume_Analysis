export interface PdfConversionResult {
  imageUrl: string;
  file: File | null;
  error?: string;
}

let pdfjsLib: any = null;
let loadPromise: Promise<any> | null = null;


async function loadPdfJs(): Promise<any> {
  // Trả lại thư viện nếu nó đã được tải.
  if (pdfjsLib) {
    return pdfjsLib;
  }

  // Trả lại promise hiện tại nếu nó đang được tải
  if (loadPromise) {
    return loadPromise;
  }

  // Chỉ chạy mã này trong trình duyệt
  if (typeof window === 'undefined') {
    throw new Error('PDF.js can only be used in a browser environment');
  }

  //tải thư viện
  loadPromise = import('pdfjs-dist').then((lib) => {
    lib.GlobalWorkerOptions.workerSrc = `/pdf.worker.min.mjs`;
    pdfjsLib = lib;
    return lib;
  });

  return loadPromise;
}

export const convertPdfToImage = async (
  file: File | Blob
): Promise<PdfConversionResult> => {
  try {
    // Tải thư viện PDF.js một cách động.
    const lib = await loadPdfJs();

    // Chuyển đổi file/blob → ArrayBuffer for pdf.js
    const arrayBuffer = await file.arrayBuffer();

    // Load PDF document
    const pdf = await lib.getDocument({ data: arrayBuffer }).promise;

    // Lấy trang đầu 
    const page = await pdf.getPage(1);

    // Đặt tỷ lệ hiển thị để có chất lượng cao hơn
    const viewport = page.getViewport({ scale: 2.0 });
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');

    if (!context) {
      throw new Error('Failed to get canvas 2D context');
    }

    // Điều chỉnh kích thước canvas để phù hợp với trang
    canvas.height = viewport.height;
    canvas.width = viewport.width;

    // Render trang vào canvas
    await page.render({ canvasContext: context, viewport: viewport }).promise;

    // Chuyển canvas thành Blob
    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob(resolve, 'image/png');
    });

    if (!blob) {
      throw new Error('Failed to create image blob from canvas');
    }

    // Tạo URL và File object từ blob
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