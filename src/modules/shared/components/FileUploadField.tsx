import React, { useMemo } from "react";
import { useDropzone } from "react-dropzone";

interface FileUploadFieldProps {
  files: File[];
  onFilesChange: (files: File[]) => void;
}

const FileUploadField: React.FC<FileUploadFieldProps> = ({ files, onFilesChange }) => {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (acceptedFiles) => onFilesChange([...files, ...acceptedFiles]),
  });

  const previews = useMemo(
    () => files.map((file) => <li key={file.name}>{file.name}</li>),
    [files]
  );

  return (
    <div>
      <div
        {...getRootProps()}
        className={`border rounded p-3 text-center ${isDragActive ? "bg-light" : ""}`}
        style={{ cursor: "pointer" }}
      >
        <input {...getInputProps()} />
        <p className="mb-0">Dosyaları sürükleyip bırakın veya seçmek için tıklayın</p>
      </div>
      <ul className="mt-3 mb-0">{previews}</ul>
    </div>
  );
};

export default FileUploadField;
