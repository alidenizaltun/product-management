import React from "react";
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
import { ProductFormValues } from "@/modules/products/types/productEditor.types";

const MEDIA_TYPES = [
  { value: 1, label: "Görsel" },
  { value: 2, label: "Video" },
  { value: 3, label: "Belge" },
  { value: 4, label: "3D Model" },
];

const emptyMedia = () => ({
  mediaType: 1,
  url: "",
  thumbnailUrl: "",
  mimeType: "image/jpeg",
  altText: "",
  isPrimary: false,
  sortOrder: 0,
});

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

const MediaUploadManager: React.FC = () => {
  const { control, register, watch, setValue, formState: { errors } } = useFormContext<ProductFormValues>();
  const { fields, append, remove, move } = useFieldArray({ control, name: "mediaItems" });
  const mediaItems = watch("mediaItems");
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

  const appendMedia = (isPrimary = false) => {
    append({ ...emptyMedia(), isPrimary, sortOrder: fields.length + 1 });
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h6 className="overline-title text-primary mb-0">Medya Galerisi</h6>
          <p className="text-soft fs-13px mb-0">Kapak görseli, galeri sırası ve alt metinleri ürün bağlamında yönetin.</p>
        </div>
        <button
          type="button"
          className="btn btn-outline-primary btn-sm"
          onClick={() => appendMedia(fields.length === 0)}
        >
          <em className="icon ni ni-plus me-1" />
          Medya Ekle
        </button>
      </div>

      <button
        type="button"
        className="border border-dashed rounded bg-lighter text-center p-4 w-100 mb-3"
        onClick={() => appendMedia(fields.length === 0)}
      >
        <em className="icon ni ni-upload-cloud fs-1 text-primary d-block mb-2" />
        <span className="fw-medium d-block">Dosya veya bağlantı ekle</span>
        <span className="text-soft fs-13px">İlk medya otomatik kapak olarak işaretlenir.</span>
      </button>

      {fields.length === 0 && (
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
              const previewUrl = mediaItem?.thumbnailUrl || mediaItem?.url;

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

                        <div className="row g-3">
                          <div className="col-12">
                            <div
                              className="rounded bg-lighter border d-flex align-items-center justify-content-center overflow-hidden"
                              style={{ aspectRatio: "16 / 9" }}
                            >
                              {previewUrl ? (
                                <img
                                  src={previewUrl}
                                  alt={mediaItem?.altText || `Medya ${index + 1}`}
                                  className="w-100 h-100"
                                  style={{ objectFit: "cover" }}
                                />
                              ) : (
                                <div className="text-center text-soft">
                                  <em className="icon ni ni-img fs-1 d-block mb-2" />
                                  <span className="fs-13px">URL girildiğinde önizleme görünür.</span>
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

                          <div className="col-12">
                            <label className="form-label">URL <span className="text-danger">*</span></label>
                            <input
                              className={`form-control ${errors.mediaItems?.[index]?.url ? "is-invalid" : ""}`}
                              placeholder="https://example.com/image.jpg"
                              {...register(`mediaItems.${index}.url`, { required: "URL zorunludur" })}
                            />
                            {errors.mediaItems?.[index]?.url && (
                              <div className="invalid-feedback">{errors.mediaItems[index].url?.message}</div>
                            )}
                          </div>

                          <div className="col-md-7">
                            <label className="form-label">Küçük Resim URL</label>
                            <input
                              className="form-control"
                              placeholder="https://example.com/thumb.jpg"
                              {...register(`mediaItems.${index}.thumbnailUrl`)}
                            />
                          </div>

                          <div className="col-md-5">
                            <label className="form-label">MIME Tipi</label>
                            <input
                              className="form-control"
                              placeholder="image/jpeg"
                              {...register(`mediaItems.${index}.mimeType`)}
                            />
                          </div>

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

      {fields.length > 0 && (
        <button
          type="button"
          className="btn btn-outline-primary btn-sm mt-3"
          onClick={() => appendMedia(false)}
        >
          <em className="icon ni ni-plus me-1" />
          Medya Ekle
        </button>
      )}
    </div>
  );
};

export default MediaUploadManager;
