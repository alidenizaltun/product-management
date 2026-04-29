import React from "react";
import { useFormContext } from "react-hook-form";
import { ProductFormValues } from "@/modules/products/types/productEditor.types";
import JsonFieldEditor from "@/modules/shared/components/JsonFieldEditor";

const GeneralInfoTab: React.FC = () => {
  const {
    register,
    formState: { errors },
  } = useFormContext<ProductFormValues>();

  return (
    <div className="row g-3">
      <div className="col-12">
        <h6 className="overline-title text-primary mb-3">Temel Bilgiler</h6>
      </div>

      <div className="col-md-4">
        <label className="form-label">
          Ürün Kodu <span className="text-danger">*</span>
        </label>
        <input
          className={`form-control ${errors.productCode ? "is-invalid" : ""}`}
          placeholder="PRD-0001"
          {...register("productCode", { required: "Ürün kodu zorunludur" })}
        />
        {errors.productCode && <div className="invalid-feedback">{errors.productCode.message}</div>}
      </div>

      <div className="col-md-4">
        <label className="form-label">
          Ürün Adı <span className="text-danger">*</span>
        </label>
        <input
          className={`form-control ${errors.name ? "is-invalid" : ""}`}
          placeholder="Ürün adını girin"
          {...register("name", { required: "Ürün adı zorunludur" })}
        />
        {errors.name && <div className="invalid-feedback">{errors.name.message}</div>}
      </div>

      <div className="col-md-4">
        <label className="form-label">
          Para Birimi <span className="text-danger">*</span>
        </label>
        <select
          className={`form-control form-select ${errors.defaultCurrencyCode ? "is-invalid" : ""}`}
          {...register("defaultCurrencyCode", { required: "Para birimi zorunludur" })}
        >
          <option value="TRY">TRY — Türk Lirası</option>
          <option value="USD">USD — Amerikan Doları</option>
          <option value="EUR">EUR — Euro</option>
          <option value="GBP">GBP — İngiliz Sterlini</option>
        </select>
        {errors.defaultCurrencyCode && (
          <div className="invalid-feedback">{errors.defaultCurrencyCode.message}</div>
        )}
      </div>

      <div className="col-md-6">
        <label className="form-label">Kısa Açıklama</label>
        <textarea
          className="form-control"
          rows={2}
          placeholder="Kısa ürün açıklaması"
          {...register("shortDescription")}
        />
      </div>

      <div className="col-md-6">
        <label className="form-label">Detaylı Açıklama</label>
        <textarea
          className="form-control"
          rows={2}
          placeholder="Detaylı ürün açıklaması"
          {...register("description")}
        />
      </div>

      <div className="col-12 mt-2">
        <h6 className="overline-title text-primary mb-3">Sınıflandırma</h6>
      </div>

      <div className="col-md-3">
        <label className="form-label">Ürün Tipi</label>
        <select className="form-control form-select" {...register("kind", { valueAsNumber: true })}>
          <option value={1}>Fiziksel Ürün</option>
          <option value={2}>Yazılım</option>
          <option value={3}>Hizmet</option>
          <option value={4}>Abonelik</option>
        </select>
      </div>

      <div className="col-md-3">
        <label className="form-label">Durum</label>
        <select className="form-control form-select" {...register("status", { valueAsNumber: true })}>
          <option value={0}>Taslak</option>
          <option value={1}>Aktif</option>
          <option value={2}>Pasif</option>
          <option value={3}>Arşivlendi</option>
        </select>
      </div>

      <div className="col-md-3">
        <label className="form-label">Marka</label>
        <input className="form-control" placeholder="Marka adı" {...register("brand")} />
      </div>

      <div className="col-md-3">
        <label className="form-label">Üretici</label>
        <input className="form-control" placeholder="Üretici firma" {...register("manufacturer")} />
      </div>

      <div className="col-12 mt-2">
        <h6 className="overline-title text-primary mb-3">Ticari Bilgiler</h6>
      </div>

      <div className="col-md-3">
        <label className="form-label">Barkod</label>
        <input className="form-control" placeholder="EAN / UPC barkod" {...register("barcode")} />
      </div>

      <div className="col-md-3">
        <label className="form-label">Ölçü Birimi</label>
        <input className="form-control" placeholder="adet, kg, m²..." {...register("unitOfMeasure")} />
      </div>

      <div className="col-md-3">
        <label className="form-label">Vergi Oranı (%)</label>
        <input
          type="number"
          step="0.01"
          min="0"
          max="100"
          className="form-control"
          placeholder="18"
          {...register("taxRate", { valueAsNumber: true })}
        />
      </div>

      <div className="col-md-3">
        <label className="form-label">Vergi Kodu</label>
        <input className="form-control" placeholder="KDV18" {...register("taxCode")} />
      </div>

      <div className="col-md-6">
        <label className="form-label">Etiketler</label>
        <input
          className="form-control"
          placeholder="etiket1,etiket2,etiket3 (virgülle ayırın)"
          {...register("tags")}
        />
      </div>

      <div className="col-md-6">
        <JsonFieldEditor
          name="metadataJson"
          label="Metadata"
          type="object"
        />
      </div>

      <div className="col-12 mt-2">
        <h6 className="overline-title text-primary mb-3">Satış Ayarları</h6>
      </div>

      <div className="col-12">
        <div className="d-flex flex-wrap gap-4">
          <div className="form-check form-switch">
            <input
              type="checkbox"
              className="form-check-input"
              id="chk-isActive"
              {...register("isActive")}
            />
            <label className="form-check-label" htmlFor="chk-isActive">
              Aktif
            </label>
          </div>
          <div className="form-check form-switch">
            <input
              type="checkbox"
              className="form-check-input"
              id="chk-isSellable"
              {...register("isSellable")}
            />
            <label className="form-check-label" htmlFor="chk-isSellable">
              Satılabilir
            </label>
          </div>
          <div className="form-check form-switch">
            <input
              type="checkbox"
              className="form-check-input"
              id="chk-isPurchasable"
              {...register("isPurchasable")}
            />
            <label className="form-check-label" htmlFor="chk-isPurchasable">
              Satın Alınabilir
            </label>
          </div>
          <div className="form-check form-switch">
            <input
              type="checkbox"
              className="form-check-input"
              id="chk-trackInventory"
              {...register("trackInventory")}
            />
            <label className="form-check-label" htmlFor="chk-trackInventory">
              Stok Takibi
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GeneralInfoTab;
