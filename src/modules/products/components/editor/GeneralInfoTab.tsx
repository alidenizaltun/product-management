import React, { useEffect, useState } from "react";
import { useFormContext } from "react-hook-form";
import { ProductFormValues } from "@/modules/products/types/productEditor.types";
import JsonFieldEditor from "@/modules/shared/components/JsonFieldEditor";
import { unitDefinitionsApi } from "@/services/unitDefinitions/unitDefinitions.api";
import type { LookupItem } from "@/services/lookup/lookups.api";

interface GeneralInfoTabProps {
    isEdit?: boolean;
}

const coerceTaxRate = (value: unknown) => {
    if (value === "" || value == null) {
        return 0;
    }

    const numericValue = Number(value);
    return Number.isFinite(numericValue) ? numericValue : 0;
};

const GeneralInfoTab: React.FC<GeneralInfoTabProps> = ({ isEdit = false }) => {
    const {
        register,
        setValue,
        watch,
        formState: { errors },
    } = useFormContext<ProductFormValues>();

    const [unitLookup, setUnitLookup] = useState<LookupItem[]>([]);
    const [advancedOpen, setAdvancedOpen] = useState(false);
    const name = watch("name");
    const productCode = watch("productCode");
    const taxRate = watch("taxRate");

    useEffect(() => {
        unitDefinitionsApi.getLookup().then(setUnitLookup).catch(() => { });
    }, []);

    const suggestSku = () => {
        const seed = (name || "urun")
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/ı/g, "i")
            .replace(/ğ/g, "g")
            .replace(/ü/g, "u")
            .replace(/ş/g, "s")
            .replace(/ö/g, "o")
            .replace(/ç/g, "c")
            .toUpperCase()
            .replace(/[^A-Z0-9]+/g, "-")
            .replace(/^-|-$/g, "")
            .slice(0, 16);

        setValue("productCode", `PRD-${seed || "URUN"}`, { shouldDirty: true, shouldValidate: true });
    };

    return (
        <div className="row g-3">
            <div className="col-12">
                <h6 className="overline-title text-primary mb-3">Başlangıç Alanları</h6>
            </div>

            <div className="col-lg-6">
                <label className="form-label">
                    Ürün Adı <span className="text-danger">*</span>
                </label>
                <input
                    className={`form-control form-control-lg ${errors.name ? "is-invalid" : ""}`}
                    placeholder="Ürün adını girin"
                    {...register("name", { required: "Ürün adı zorunludur" })}
                />
                {errors.name && <div className="invalid-feedback">{errors.name.message}</div>}
            </div>

            <div className="col-lg-3 col-md-6">
                <label className="form-label">Ürün Tipi</label>
                <select className="form-control form-select form-control-lg" {...register("kind", { valueAsNumber: true })}>
                    <option value={1}>Fiziksel</option>
                    <option value={2}>Yazılım</option>
                    <option value={3}>Hizmet</option>
                    <option value={4}>Abonelik</option>
                </select>
            </div>

            <div className="col-lg-3 col-md-6">
                <label className="form-label">Durum</label>
                <select className="form-control form-select form-control-lg" {...register("status", { valueAsNumber: true })}>
                    <option value={0}>Taslak</option>
                    <option value={1}>Aktif</option>
                    <option value={2}>Pasif</option>
                    <option value={3}>Arşivlendi</option>
                </select>
            </div>

            <div className="col-md-6">
                <label className="form-label">Marka</label>
                <input className="form-control" placeholder="Marka adı" {...register("brand")} />
            </div>

            <div className="col-md-6">
                <label className="form-label">
                    SKU / Ürün Kodu <span className="text-danger">*</span>
                </label>
                <div className="input-group">
                    <input
                        className={`form-control ${errors.productCode ? "is-invalid" : ""}`}
                        placeholder="PRD-0001"
                        {...register("productCode", { required: "Ürün kodu zorunludur" })}
                    />
                    <button
                        type="button"
                        className="btn btn-outline-light"
                        disabled={!name?.trim()}
                        onClick={suggestSku}
                    >
                        <em className="icon ni ni-magic me-1" />
                        Öner
                    </button>
                </div>
                {errors.productCode && <div className="invalid-feedback d-block">{errors.productCode.message}</div>}
                {!productCode?.trim() && (
                    <div className="form-note">Ürün adından otomatik SKU önerisi alabilirsiniz.</div>
                )}
            </div>

            <div className="col-md-6">
                <label className="form-label">Kısa Açıklama</label>
                <textarea
                    className="form-control"
                    rows={3}
                    placeholder="Vitrin kartında görünecek kısa açıklama"
                    {...register("shortDescription")}
                />
            </div>

            <div className="col-md-6">
                <label className="form-label">Detaylı Açıklama</label>
                <textarea
                    className="form-control"
                    rows={3}
                    placeholder="Ürün detayında kullanılacak açıklamayı yazın"
                    {...register("description")}
                />
            </div>

            <div className="col-12 mt-2">
                <button
                    type="button"
                    className="btn btn-outline-light w-100 d-flex justify-content-between align-items-center"
                    onClick={() => setAdvancedOpen((current) => !current)}
                >
                    <span>
                        <em className="icon ni ni-setting me-1" />
                        Gelişmiş kimlik ve satış ayarları
                    </span>
                    <em className={`icon ni ni-chevron-${advancedOpen ? "up" : "down"}`} />
                </button>
            </div>

            {advancedOpen && (
                <>
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

                    <div className="col-md-4">
                        <label className="form-label">Üretici</label>
                        <input className="form-control" placeholder="Üretici firma" {...register("manufacturer")} />
                    </div>

                    <div className="col-md-4">
                        <label className="form-label">Barkod</label>
                        <input className="form-control" placeholder="EAN / UPC barkod" {...register("barcode")} />
                    </div>

                    <div className="col-md-4">
                        <label className="form-label">Ölçü Birimi</label>
                        <select className="form-control form-select" {...register("unitDefinitionId")}>
                            <option value="">— Seçiniz —</option>
                            {unitLookup.map((unit) => (
                                <option key={unit.id} value={unit.id}>
                                    {unit.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="col-md-4">
                        <label className="form-label">Vergi Oranı (%)</label>
                        {isEdit ? (
                            <>
                                <input
                                    type="hidden"
                                    value={coerceTaxRate(taxRate)}
                                    {...register("taxRate", { setValueAs: coerceTaxRate })}
                                />
                                <input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    max="100"
                                    className="form-control"
                                    value={coerceTaxRate(taxRate)}
                                    disabled
                                    readOnly
                                />
                            </>
                        ) : (
                            <input
                                type="number"
                                step="0.01"
                                min="0"
                                max="100"
                                className="form-control"
                                placeholder="0"
                                {...register("taxRate", { setValueAs: coerceTaxRate })}
                            />
                        )}
                    </div>

                    <div className="col-md-4">
                        <label className="form-label">Vergi Kodu</label>
                        <input className="form-control" placeholder="KDV18" {...register("taxCode")} />
                    </div>

                    <div className="col-md-6">
                        <label className="form-label">Etiketler</label>
                        <input
                            className="form-control"
                            placeholder="etiket1, etiket2, etiket3"
                            {...register("tags")}
                        />
                    </div>

                    <div className="col-md-6">
                        <JsonFieldEditor name="metadataJson" label="Metadata" type="object" />
                    </div>

                    <div className="col-12">
                        <h6 className="overline-title text-primary mb-3">Satış Ayarları</h6>
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
                </>
            )}
        </div>
    );
};

export default GeneralInfoTab;
