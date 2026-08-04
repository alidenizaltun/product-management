import React, { useEffect, useState } from "react";
import { useFormContext } from "react-hook-form";
import { ProductFormValues } from "@/modules/products/types/productEditor.types";
import JsonFieldEditor from "@/modules/shared/components/JsonFieldEditor";
import { TextInput, NumberInput, Textarea, Checkbox, FormField } from "@/modules/shared/components";
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
    const kind = watch("kind");
    const taxRate = watch("taxRate");
    const isPhysicalProduct = Number(kind ?? 1) === 1;
    const isSoftwareProduct = Number(kind ?? 1) === 2;

    useEffect(() => {
        if (isSoftwareProduct) {
            setValue("trackInventory", false, { shouldDirty: true, shouldValidate: true });
        }

        if (!isPhysicalProduct) {
            setValue("unitDefinitionId", "", { shouldDirty: false, shouldValidate: false });
            return;
        }

        if (unitLookup.length === 0) {
            unitDefinitionsApi.getLookup().then(setUnitLookup).catch(() => { });
        }
    }, [isPhysicalProduct, isSoftwareProduct, setValue, unitLookup.length]);

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
                <TextInput
                    label="Ürün Adı"
                    required
                    size="lg"
                    placeholder="Ürün adını girin"
                    error={errors.name?.message}
                    {...register("name", { required: "Ürün adı zorunludur" })}
                />
            </div>

            <div className="col-lg-3 col-md-6">
                <FormField label="Ürün Tipi" htmlFor="product-kind-select">
                    <select
                        id="product-kind-select"
                        className="form-control form-select form-control-lg"
                        {...register("kind", { valueAsNumber: true })}
                    >
                        <option value={2}>Yazılım</option>
                        {/* <option value={1}>Fiziksel</option> */}
                        {/* <option value={3}>Hizmet</option> */}
                        {/* <option value={4}>Abonelik</option> */}
                    </select>
                </FormField>
            </div>

            <div className="col-lg-3 col-md-6">
                <FormField label="Durum" htmlFor="product-status-select">
                    <select
                        id="product-status-select"
                        className="form-control form-select form-control-lg"
                        {...register("status", { valueAsNumber: true })}
                    >
                        <option value={0}>Taslak</option>
                        <option value={1}>Aktif</option>
                        <option value={2}>Pasif</option>
                        <option value={3}>Arşivlendi</option>
                    </select>
                </FormField>
            </div>

            <div className="col-md-6">
                <TextInput label="Marka" placeholder="Marka adı" {...register("brand")} />
            </div>

            <div className="col-md-6">
                <FormField
                    label="SKU / Ürün Kodu"
                    htmlFor="product-code-input"
                    required
                    error={errors.productCode?.message}
                    hint={!productCode?.trim() ? "Ürün adından otomatik SKU önerisi alabilirsiniz." : undefined}
                >
                    <div className="input-group">
                        <input
                            id="product-code-input"
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
                </FormField>
            </div>

            <div className="col-md-6">
                <Textarea
                    label="Kısa Açıklama"
                    rows={3}
                    placeholder="Vitrin kartında görünecek kısa açıklama"
                    {...register("shortDescription")}
                />
            </div>

            <div className="col-md-6">
                <Textarea
                    label="Detaylı Açıklama"
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
                    <input type="hidden" {...register("defaultCurrencyCode")} />

                    <div className={isSoftwareProduct ? "col-md-12" : "col-md-6"}>
                        <TextInput label="Üretici" placeholder="Üretici firma" {...register("manufacturer")} />
                    </div>

                    {!isSoftwareProduct && (
                        <div className="col-md-6">
                            <TextInput label="Barkod" placeholder="EAN / UPC barkod" {...register("barcode")} />
                        </div>
                    )}

                    <div className="col-md-6">
                        {isEdit ? (
                            <>
                                <input
                                    type="hidden"
                                    value={coerceTaxRate(taxRate)}
                                    {...register("taxRate", { setValueAs: coerceTaxRate })}
                                />
                                <NumberInput
                                    label="Vergi Oranı (%)"
                                    step="0.01"
                                    min={0}
                                    max={100}
                                    value={coerceTaxRate(taxRate)}
                                    disabled
                                    readOnly
                                    onChange={() => {}}
                                />
                            </>
                        ) : (
                            <NumberInput
                                label="Vergi Oranı (%)"
                                step="0.01"
                                min={0}
                                max={100}
                                placeholder="0"
                                {...register("taxRate", { setValueAs: coerceTaxRate })}
                            />
                        )}
                    </div>

                    <div className="col-md-6">
                        <TextInput label="Vergi Kodu" placeholder="KDV18" {...register("taxCode")} />
                    </div>

                    <div className="col-md-6">
                        <TextInput label="Etiketler" placeholder="etiket1, etiket2, etiket3" {...register("tags")} />
                    </div>

                    <div className="col-md-6">
                        <JsonFieldEditor name="metadataJson" label="Metadata" type="object" />
                    </div>

                    <div className="col-12">
                        <h6 className="overline-title text-primary mb-3">Satış Ayarları</h6>
                        <div className="d-flex flex-wrap gap-4">
                            <Checkbox label="Aktif" switchStyle {...register("isActive")} />
                            <Checkbox label="Satılabilir" switchStyle {...register("isSellable")} />
                            <Checkbox label="Satın Alınabilir" switchStyle {...register("isPurchasable")} />
                            {isSoftwareProduct ? (
                                <Checkbox label="Stok Takibi" switchStyle checked={false} disabled readOnly />
                            ) : (
                                <Checkbox label="Stok Takibi" switchStyle {...register("trackInventory")} />
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default GeneralInfoTab;
