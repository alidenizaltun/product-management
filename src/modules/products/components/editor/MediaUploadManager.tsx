import React, { useState } from "react";
import { Button } from "reactstrap";
import { useFieldArray, useFormContext, useWatch } from "react-hook-form";
import FileUploadField from "@/modules/shared/components/FileUploadField";
import { ProductFormValues } from "@/modules/products/types/productEditor.types";

const MediaUploadManager: React.FC = () => {
  const { control, register, setValue } = useFormContext<ProductFormValues>();
  const { fields, append, remove } = useFieldArray({ control, name: "metadata.media" });
  const [files, setFiles] = useState<File[]>([]);
  const mediaValues = useWatch({ control, name: "metadata.media" }) ?? [];

  const handleFilesChange = (nextFiles: File[]) => {
    const newFiles = nextFiles.filter(
      (file) => !files.some((prev) => prev.name === file.name && prev.size === file.size)
    );

    if (newFiles.length) {
      newFiles.forEach((file, index) => {
        append({
          fileName: file.name,
          isCover: fields.length === 0 && index === 0,
          sortOrder: fields.length + index + 1,
        });
      });
    }

    setFiles(nextFiles);
  };

  const handleCoverChange = (index: number) => {
    const current = mediaValues ?? [];
    current.forEach((_item, idx) => {
      setValue(`metadata.media.${idx}.isCover` as const, idx === index, { shouldDirty: true });
    });
  };

  const handleRemove = (index: number) => {
    const fileName = mediaValues[index]?.fileName;
    remove(index);
    if (fileName) {
      setFiles((prev) => prev.filter((file) => file.name !== fileName));
    }
  };

  return (
    <div className="card card-bordered">
      <div className="card-inner border-bottom">
        <div>
          <h6 className="mb-0">Medya</h6>
          <small className="text-muted">Gorselleri yukleyin, kapak ve siralama belirleyin.</small>
        </div>
      </div>
      <div className="card-inner">
        <div className="mb-3">
          <FileUploadField files={files} onFilesChange={handleFilesChange} />
        </div>

        {fields.length === 0 ? (
          <div className="alert alert-light mb-0">Henus medya eklenmedi.</div>
        ) : (
          <div className="d-flex flex-column gap-2">
            {fields.map((field, index) => (
              <div key={field.id} className="border rounded p-3">
                <div className="row g-3 align-items-end">
                  <div className="col-md-4">
                    <label className="form-label">Dosya</label>
                    <input className="form-control" readOnly value={mediaValues[index]?.fileName ?? ""} />
                  </div>
                  <div className="col-md-2">
                    <label className="form-label">Sira</label>
                    <input
                      type="number"
                      className="form-control"
                      {...register(`metadata.media.${index}.sortOrder` as const, { valueAsNumber: true })}
                    />
                  </div>
                  <div className="col-md-3">
                    <label className="form-label">Varyant SKU</label>
                    <input className="form-control" {...register(`metadata.media.${index}.variantSku` as const)} />
                  </div>
                  <div className="col-md-2">
                    <div className="form-check mt-4">
                      <input
                        type="checkbox"
                        className="form-check-input"
                        checked={Boolean(mediaValues[index]?.isCover)}
                        onChange={() => handleCoverChange(index)}
                      />
                      <label className="form-check-label">Kapak</label>
                    </div>
                  </div>
                  <div className="col-md-1 text-end">
                    <Button color="danger" size="sm" type="button" onClick={() => handleRemove(index)}>
                      Kaldir
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MediaUploadManager;
