import React, { useState } from "react";
import { DndContext, KeyboardSensor, PointerSensor, closestCenter, useSensor, useSensors } from "@dnd-kit/core";
import type { DragEndEvent } from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  rectSortingStrategy,
  sortableKeyboardCoordinates,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useFieldArray, useFormContext } from "react-hook-form";
import { FileUploadZone } from "@/components/shared/FileUploadZone";
import { showApiError, showSuccess } from "@/components/shared/NotificationAlert";
import { useProductMedia } from "@/application/hooks/useProductMedia";
import { resolveMediaUrl } from "@/infrastructure/helpers/mediaUrl";
import { ProductFormValues } from "@/pages/products/types/productEditor.types";

const MEDIA_TYPES = [
  { value: 1, label: "Görsel" },
  { value: 2, label: "Video" },
  { value: 3, label: "Belge" },
  { value: 4, label: "3D Model" },
];

const IMAGE_ACCEPT = {
  "image/jpeg": [".jpg", ".jpeg"],
  "image/png": [".png"],
  "image/gif": [".gif"],
  "image/webp": [".webp"],
};

const MAX_FILE_SIZE = 8 * 1024 * 1024;
const MAX_FILES_PER_UPLOAD = 20;

const SortableMediaCard: React.FC<{
  id: string;
  children: (dragHandleProps: {
    attributes: ReturnType<typeof useSortable>["attributes"];
    listeners: ReturnType<typeof useSortable>["listeners"];
  }) => React.ReactNode;
}> = ({ id, children }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });

  return (
    <div
      ref={setNodeRef}
      className={`col-lg-6 pricing-sortable-item ${isDragging ? "is-dragging" : ""}`}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
      }}
    >
      {children({ attributes, listeners })}
    </div>
  );
};

interface MediaUploadManagerProps {
  productId: string;
}

const MediaUploadManager: React.FC<MediaUploadManagerProps> = ({ productId }) => {
  const { control, register, watch, setValue, formState: { errors } } = useFormContext<ProductFormValues>();
  const { fields, append, remove, move } = useFieldArray({ control, name: "mediaItems" });
  const mediaItems = watch("mediaItems");
  const { uploadImagesMutation } = useProductMedia();
  const [uploadError, setUploadError] = useState<string | null>(null);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const reorderMedia = (oldIndex: number, newIndex: number) => {
    if (oldIndex === newIndex || oldIndex < 0 || newIndex < 0) return;

    move(oldIndex, newIndex);
    arrayMove(mediaItems ?? [], oldIndex, newIndex).forEach((_, mediaIndex) => {
      setValue(`mediaItems.${mediaIndex}.sortOrder`, mediaIndex + 1, { shouldDirty: true });
    });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = fields.findIndex((field) => field.id === active.id);
    const newIndex = fields.findIndex((field) => field.id === over.id);
    reorderMedia(oldIndex, newIndex);
  };

  const handleFilesSelected = async (files: File[]) => {
    if (!productId || files.length === 0) return;

    setUploadError(null);
    try {
      const created = await uploadImagesMutation.mutateAsync({ productId, files });
      const currentCount = fields.length;
      created.forEach((item, index) => {
        append({
          mediaType: item.mediaType || 1,
          url: item.url,
          thumbnailUrl: item.thumbnailUrl || item.url,
          mimeType: item.mimeType || "image/jpeg",
          altText: item.altText || "",
          isPrimary: Boolean(item.isPrimary) || (currentCount === 0 && index === 0),
          sortOrder: Number.isFinite(item.sortOrder) ? Number(item.sortOrder) : currentCount + index + 1,
        });
      });
      showSuccess(created.length === 1 ? "Görsel yüklendi." : `${created.length} görsel yüklendi.`);
    } catch (error) {
      showApiError(error);
      setUploadError("Görseller yüklenirken bir hata oluştu. Lütfen tekrar deneyin.");
    }
  };

  const isUploading = uploadImagesMutation.isPending;

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h6 className="overline-title text-primary mb-0">Medya Galerisi</h6>
          <p className="text-soft fs-13px mb-0">
            Birden fazla görsel seçin; dosyalar sunucuya yüklenir ve ürün galerisine eklenir.
          </p>
        </div>
      </div>

      <FileUploadZone
        onFilesSelected={handleFilesSelected}
        accept={IMAGE_ACCEPT}
        maxFiles={MAX_FILES_PER_UPLOAD}
        maxSize={MAX_FILE_SIZE}
        disabled={isUploading}
        label={isUploading ? "Görseller yükleniyor..." : "Görselleri sürükleyin veya tıklayarak seçin"}
        hint="JPG, PNG, GIF veya WEBP. En fazla 20 dosya, dosya başına 8 MB. İlk görsel kapak olarak işaretlenir."
        className="mb-3"
      />

      {uploadError && (
        <div className="alert alert-danger alert-icon mb-3">
          <em className="icon ni ni-alert-circle" />
          {uploadError}
        </div>
      )}

      {fields.length === 0 && !isUploading && (
        <div className="text-center py-5 text-soft">
          <em className="icon ni ni-img fs-2 d-block mb-2" />
          <p className="mb-0">Henüz medya eklenmedi.</p>
        </div>
      )}

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={fields.map((field) => field.id)} strategy={rectSortingStrategy}>
          <div className="row g-3">
            {fields.map((field, index) => {
              const mediaItem = mediaItems?.[index];
              const previewUrl = resolveMediaUrl(mediaItem?.thumbnailUrl || mediaItem?.url);
              const isImage = (mediaItem?.mediaType ?? 1) === 1;

              return (
                <SortableMediaCard id={field.id} key={field.id}>
                  {({ attributes, listeners }) => (
                    <div className="card card-bordered h-100">
                      <div className="card-inner">
                        <div className="d-flex justify-content-between align-items-center mb-3">
                          <span className="badge bg-outline-primary">
                            {index === 0 ? "Kapak adayı" : `Galeri #${index + 1}`}
                          </span>
                          <div className="d-flex flex-wrap align-items-center justify-content-end gap-1">
                            <span className="pricing-order-chip" title="Sıra sürükleyerek değiştirilir">
                              Sıra {index + 1}
                            </span>
                            <button
                              type="button"
                              className="btn btn-sm btn-icon btn-outline-light pricing-drag-handle"
                              title="Sürükleyerek sırala"
                              {...attributes}
                              {...listeners}
                            >
                              <em className="icon ni ni-drag" />
                            </button>
                            <button
                              type="button"
                              className="btn btn-sm btn-icon btn-outline-light"
                              disabled={index === 0}
                              onClick={() => reorderMedia(index, index - 1)}
                              title="Yukarı taşı"
                            >
                              <em className="icon ni ni-chevron-up" />
                            </button>
                            <button
                              type="button"
                              className="btn btn-sm btn-icon btn-outline-light"
                              disabled={index === fields.length - 1}
                              onClick={() => reorderMedia(index, index + 1)}
                              title="Aşağı taşı"
                            >
                              <em className="icon ni ni-chevron-down" />
                            </button>
                            <button
                              type="button"
                              className="btn btn-sm btn-icon btn-trigger text-danger"
                              onClick={() => remove(index)}
                              title="Medyayı Sil"
                            >
                              <em className="icon ni ni-trash" />
                            </button>
                          </div>
                        </div>
                        <input type="hidden" {...register(`mediaItems.${index}.sortOrder`, { valueAsNumber: true })} />
                        <input type="hidden" {...register(`mediaItems.${index}.url`)} />
                        <input type="hidden" {...register(`mediaItems.${index}.thumbnailUrl`)} />
                        <input type="hidden" {...register(`mediaItems.${index}.mimeType`)} />

                        <div className="row g-3">
                          <div className="col-12">
                            <div
                              className="rounded bg-lighter border d-flex align-items-center justify-content-center overflow-hidden"
                              style={{ aspectRatio: "16 / 9" }}
                            >
                              {previewUrl && isImage ? (
                                <img
                                  src={previewUrl}
                                  alt={mediaItem?.altText || `Medya ${index + 1}`}
                                  className="w-100 h-100"
                                  style={{ objectFit: "cover" }}
                                />
                              ) : previewUrl ? (
                                <div className="text-center text-soft">
                                  <em className="icon ni ni-file fs-1 d-block mb-2" />
                                  <span className="fs-13px">Önizleme yok</span>
                                </div>
                              ) : (
                                <div className="text-center text-soft">
                                  <em className="icon ni ni-img fs-1 d-block mb-2" />
                                  <span className="fs-13px">Görsel henüz yüklenmedi.</span>
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="col-md-4">
                            <label className="form-label">Medya Tipi</label>
                            <select
                              className="form-control form-select"
                              {...register(`mediaItems.${index}.mediaType`, { valueAsNumber: true })}
                            >
                              {MEDIA_TYPES.map((mt) => (
                                <option key={mt.value} value={mt.value}>{mt.label}</option>
                              ))}
                            </select>
                          </div>

                          <div className="col-md-8 d-flex align-items-end pb-1">
                            <div className="form-check form-switch">
                              <input
                                type="checkbox"
                                className="form-check-input"
                                id={`media-primary-${field.id}`}
                                {...register(`mediaItems.${index}.isPrimary`)}
                              />
                              <label className="form-check-label" htmlFor={`media-primary-${field.id}`}>
                                Birincil Görsel
                              </label>
                            </div>
                          </div>

                          {errors.mediaItems?.[index]?.url && (
                            <div className="col-12">
                              <div className="invalid-feedback d-block">{errors.mediaItems[index].url?.message}</div>
                            </div>
                          )}

                          <div className="col-12">
                            <label className="form-label">Alt Metin</label>
                            <input
                              className="form-control"
                              placeholder="Ürün görseli açıklaması (SEO)"
                              {...register(`mediaItems.${index}.altText`)}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </SortableMediaCard>
              );
            })}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
};

export default MediaUploadManager;
