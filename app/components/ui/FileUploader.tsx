import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { formatSize } from "~/lib/utils";
interface FileUploaderProps {
    onFileSelect: (file: File | null) => void;
}

const FileUploader = ({ onFileSelect }: FileUploaderProps) => {
    
    const onDrop = useCallback((acceptedFiles: File[]) => {
        const file = acceptedFiles[0] || null;
        onFileSelect?.(file);
    }, [onFileSelect]);

    const maxFileSize = 20 * 1024 * 1024;
    const { getRootProps, getInputProps, isDragActive, acceptedFiles } = useDropzone({ 
        onDrop,
        multiple: false,
        accept: {
            'application/pdf': ['.pdf']
        },
        maxSize: 20 * 1024 * 1024, // 20 MB

     });

    const file = acceptedFiles[0] || null;
  return (
    <div className="w-full gradient-border ">
        <div {...getRootProps()}>
            <input {...getInputProps()} />

            {file ? (
                <div className="uploader-select-file" onClick={(e) => {
                    e.stopPropagation();
                    onFileSelect(file);
                }}>
                       <img src="/images/pdf.png" alt="file" className="size-10" />
                    <div className="flex items-center space-x-3">
                        <p className="text-lg font-semibold text-gray-700">{file.name}</p>
                        <p className="text-md text-gray-500">{formatSize(file.size)}</p>
                    </div>
                    <button className="p-2 cursor-pointer" onClick={(e) => {
                        onFileSelect?.(null);
                    }}>
                        <img src="/icons/cross.svg" alt="remove" className="w-4 h-4" />
                    </button>
                </div>
            ):(
                <div>
                  <div className="space-y-4 mb-2 cursor-pointer flex mx-auto flex-col w-16 h-16 items-center justify-center">
                        <img src="/icons/info.svg" alt="upload" className="size-20" />
                    </div>

                    <p className="text-lg text-gray-500">
                        <span className="font-semibold">
                            Click to upload
                        </span> or drag and drop
                    </p>
                    <p className="text-lg text-gray-500">PDF (max {formatSize(maxFileSize)})</p>
                </div>
                ) }
        </div>
    </div>
  )
}

export default FileUploader