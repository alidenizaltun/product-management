import React from "react";
import { useDropzone } from "react-dropzone";
import { Row, Col, Progress } from "reactstrap";
import Icon from "@/components/icon/Icon";

// ─── Types ───────────────────────────────────────────────────────────────────

interface UploadedFile {
  name: string;
  size: number;
  type: string;
  preview?: string;
  progress?: number;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getFileIcon(type: string): string {
  if (type.startsWith("image/")) return "img";
  if (type.startsWith("video/")) return "video";
  if (type.includes("pdf")) return "file-pdf";
  if (type.includes("spreadsheet") || type.includes("excel")) return "file-xls";
  if (type.includes("word") || type.includes("document")) return "file-doc";
  if (type.includes("zip") || type.includes("archive")) return "file-zip";
  return "file";
}

// ─── FileUploadZone ──────────────────────────────────────────────────────────

interface FileUploadZoneProps {
  onFilesSelected: (files: File[]) => void;
  accept?: Record<string, string[]>;
  maxFiles?: number;
  maxSize?: number;
  label?: string;
  hint?: string;
  disabled?: boolean;
  className?: string;
}

const FileUploadZone: React.FC<FileUploadZoneProps> = ({
  onFilesSelected,
  accept,
  maxFiles = 1,
  maxSize = 5 * 1024 * 1024,
  label = "Dosyaları sürükleyin veya tıklayın",
  hint,
  disabled = false,
  className = "",
}) => {
  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        onFilesSelected(acceptedFiles);
      }
    },
    accept,
    maxFiles,
    maxSize,
    disabled,
  });

  let borderColor = "#dbdfea";
  let bgColor = "transparent";
  if (isDragActive && !isDragReject) {
    borderColor = "var(--bs-primary)";
    bgColor = "rgba(101, 118, 255, 0.04)";
  } else if (isDragReject) {
    borderColor = "var(--bs-danger)";
    bgColor = "rgba(233, 67, 77, 0.04)";
  }

  return (
    <div
      {...getRootProps()}
      className={`text-center p-4 rounded ${disabled ? "opacity-50" : ""} ${className}`}
      style={{
        border: `2px dashed ${borderColor}`,
        backgroundColor: bgColor,
        cursor: disabled ? "not-allowed" : "pointer",
        transition: "border-color 0.2s, background-color 0.2s",
      }}
    >
      <input {...getInputProps()} />
      <div className="py-3">
        <div className="mb-2">
          <Icon name="upload-cloud" style={{ fontSize: 36 }} className="text-primary" />
        </div>
        <p className="fw-medium mb-1">{label}</p>
        {hint && <span className="sub-text">{hint}</span>}
        {!hint && maxSize && (
          <span className="sub-text">Maks. {formatFileSize(maxSize)}</span>
        )}
      </div>
    </div>
  );
};

// ─── FilePreview ─────────────────────────────────────────────────────────────

interface FilePreviewProps {
  files: UploadedFile[];
  onRemove: (index: number) => void;
  showProgress?: boolean;
}

const FilePreview: React.FC<FilePreviewProps> = ({
  files,
  onRemove,
  showProgress = false,
}) => {
  if (files.length === 0) return null;

  return (
    <div className="mt-3">
      {files.map((file, index) => (
        <div
          key={`${file.name}-${index}`}
          className="d-flex align-items-center p-2 mb-2 border rounded"
        >
          {file.preview ? (
            <img
              src={file.preview}
              alt={file.name}
              className="rounded me-2"
              style={{ width: 40, height: 40, objectFit: "cover" }}
            />
          ) : (
            <div
              className="rounded bg-light d-flex align-items-center justify-content-center me-2"
              style={{ width: 40, height: 40 }}
            >
              <Icon name={getFileIcon(file.type)} className="text-primary" />
            </div>
          )}

          <div className="flex-grow-1 overflow-hidden">
            <span className="d-block fw-medium text-truncate" style={{ fontSize: 13 }}>
              {file.name}
            </span>
            <span className="sub-text" style={{ fontSize: 11 }}>
              {formatFileSize(file.size)}
            </span>
            {showProgress && file.progress !== undefined && file.progress < 100 && (
              <Progress
                value={file.progress}
                className="mt-1"
                style={{ height: 4 }}
                color="primary"
              />
            )}
          </div>

          <button
            type="button"
            className="btn btn-icon btn-sm btn-trigger ms-2"
            onClick={() => onRemove(index)}
          >
            <Icon name="cross" className="text-danger" />
          </button>
        </div>
      ))}
    </div>
  );
};

// ─── ImagePreviewGrid ────────────────────────────────────────────────────────

interface ImagePreviewGridProps {
  images: { url: string; alt?: string }[];
  onRemove?: (index: number) => void;
  columns?: number;
}

const ImagePreviewGrid: React.FC<ImagePreviewGridProps> = ({
  images,
  onRemove,
  columns = 4,
}) => {
  if (images.length === 0) return null;

  const colSize = Math.floor(12 / columns);

  return (
    <Row className="g-3 mt-2">
      {images.map((image, index) => (
        <Col key={index} xs={6} sm={colSize}>
          <div className="position-relative rounded overflow-hidden border" style={{ paddingBottom: "100%" }}>
            <img
              src={image.url}
              alt={image.alt || `Görsel ${index + 1}`}
              className="position-absolute top-0 start-0 w-100 h-100"
              style={{ objectFit: "cover" }}
            />
            {onRemove && (
              <button
                type="button"
                className="btn btn-icon btn-sm position-absolute"
                style={{ top: 4, right: 4, backgroundColor: "rgba(0,0,0,0.5)", borderRadius: "50%" }}
                onClick={() => onRemove(index)}
              >
                <Icon name="cross" className="text-white" />
              </button>
            )}
          </div>
        </Col>
      ))}
    </Row>
  );
};

export { FileUploadZone, FilePreview, ImagePreviewGrid };
export type { UploadedFile, FileUploadZoneProps, FilePreviewProps, ImagePreviewGridProps };
