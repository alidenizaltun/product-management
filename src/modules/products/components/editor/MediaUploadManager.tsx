import React from "react";
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

const MediaUploadManager: React.FC = () => {
  const { control, register, watch, formState: { errors } } = useFormContext<ProductFormValues>();
  const { fields, append, remove } = useFieldArray({ control, name: "mediaItems" });
  const mediaItems = watch("mediaItems");

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
          onClick={() => append(emptyMedia())}
        >
          <em className="icon ni ni-plus me-1" />
          Medya Ekle
        </button>
      </div>

      <button
        type="button"
        className="border border-dashed rounded bg-lighter text-center p-4 w-100 mb-3"
        onClick={() => append({ ...emptyMedia(), isPrimary: fields.length === 0, sortOrder: fields.length + 1 })}
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

      <div className="row g-3">
        {fields.map((field, index) => {
          const mediaItem = mediaItems?.[index];
          const previewUrl = mediaItem?.thumbnailUrl || mediaItem?.url;

          return (
          <div key={field.id} className="col-lg-6">
            <div className="card card-bordered h-100">
              <div className="card-inner">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <span className="badge bg-outline-primary">{index === 0 ? "Kapak adayı" : `Galeri #${index + 1}`}</span>
                  <button
                    type="button"
                    className="btn btn-sm btn-icon btn-trigger text-danger"
                    onClick={() => remove(index)}
                    title="Medyayı Sil"
                  >
                    <em className="icon ni ni-trash" />
                  </button>
                </div>

                <div className="row g-3">
                  <div className="col-12">
                    <div className="rounded bg-lighter border d-flex align-items-center justify-content-center overflow-hidden" style={{ aspectRatio: "16 / 9" }}>
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

                  <div className="col-md-4">
                    <label className="form-label">Sıralama</label>
                    <input
                      type="number"
                      min="0"
                      className="form-control"
                      placeholder="1"
                      {...register(`mediaItems.${index}.sortOrder`, { valueAsNumber: true })}
                    />
                  </div>

                  <div className="col-md-4 d-flex align-items-end pb-1">
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
          </div>
          );
        })}
      </div>

      {fields.length > 0 && (
        <button
          type="button"
          className="btn btn-outline-primary btn-sm mt-3"
          onClick={() => append(emptyMedia())}
        >
          <em className="icon ni ni-plus me-1" />
          Medya Ekle
        </button>
      )}
    </div>
  );
};

export default MediaUploadManager;
