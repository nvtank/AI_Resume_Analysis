import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { formatSize } from "~/lib/utils";
import { FaCloudUploadAlt, FaFilePdf, FaTimes } from "react-icons/fa"; // Importing FontAwesome icons from react-icons

interface FileUploaderProps {
  onFileSelect: (file: File | null) => void;
}

const FileUploader = ({ onFileSelect }: FileUploaderProps) => {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0] || null;
      onFileSelect?.(file);
    },
    [onFileSelect]
  );

  const maxFileSize = 20 * 1024 * 1024;
  const { getRootProps, getInputProps, isDragActive, acceptedFiles } =
    useDropzone({
      onDrop,
      multiple: false,
      accept: {
        "application/pdf": [".pdf"],
      },
      maxSize: maxFileSize,
    });

  const file = acceptedFiles[0] || null;
  return (
    <div className="w-full">
      <div {...getRootProps()}>
        <input {...getInputProps()} />

        {file ? (
          <div
            className="uploader-selected-file"
            onClick={(e) => {
              e.stopPropagation();
              onFileSelect(file);
            }}
          >
            <div className="flex items-center gap-4">
               <div className="p-3 bg-gray-100 rounded-xl">
                 <FaFilePdf className="w-6 h-6 text-black" />
               </div>
              <div className="flex flex-col">
                <p className="text-sm font-semibold text-[var(--color-text-primary)]">
                  {file.name}
                </p>
                <p className="text-xs text-[var(--color-text-secondary)]">
                  {formatSize(file.size)}
                </p>
              </div>
            </div>
            <button
              className="p-2 cursor-pointer hover:bg-gray-100 rounded-full transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                onFileSelect?.(null);
              }}
            >
              <FaTimes className="w-4 h-4 text-[var(--color-text-secondary)]" />
            </button>
          </div>
        ) : (
          <div className={`uplader-drag-area group ${isDragActive ? "border-black bg-gray-50" : ""}`}>
            <div className="space-y-4 mb-4 cursor-pointer flex mx-auto flex-col items-center justify-center">
              <div className="p-4 bg-white rounded-full border border-[var(--color-border)] shadow-sm group-hover:shadow-md transition-shadow">
                  <FaCloudUploadAlt className="w-8 h-8 text-black" />
              </div>
            </div>

            <p className="text-md text-[var(--color-text-secondary)]">
              <span className="font-semibold text-black ">Click to upload</span>{" "}
              or drag and drop
            </p>
            <p className="text-md text-[var(--color-text-secondary)] mt-2">
              PDF (max {formatSize(maxFileSize)})
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FileUploader;