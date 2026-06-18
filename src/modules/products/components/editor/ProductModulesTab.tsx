import React from "react";
import { useFieldArray, useFormContext, useWatch } from "react-hook-form";
import { ProductFormValues } from "@/modules/products/types/productEditor.types";

const EMPTY_MODULE = {
    moduleCode: "",
    name: "",
    description: "",
    currencyCode: "TRY",
    isOptional: true,
    isActive: true,
    sortOrder: 0,
    offeringPrices: [],
};

const EMPTY_OFFERING_PRICE = {
    productLicenseOfferingId: undefined as string | undefined,
    licenseOfferingTempId: undefined as string | undefined,
    price: 0,
    currencyCode: "TRY",
    isActive: true,
};

// Her modülün fiyat satırları için ayrı bileşen
const ModuleOfferingPricesSection: React.FC<{ moduleIndex: number }> = ({ moduleIndex }) => {
    const { register, control, setValue } = useFormContext<ProductFormValues>();
    const { fields, append, remove } = useFieldArray({
        control,
        name: `modules.${moduleIndex}.offeringPrices`,
    });

    const licenseOfferings = useWatch({ control, name: "licenseOfferings" }) ?? [];
    const watchedPrices = useWatch({ control, name: `modules.${moduleIndex}.offeringPrices` }) ?? [];

    // Kaydedilmiş (id) veya yeni eklenmiş (_tempId) tüm teklifleri göster
    const allOfferings = licenseOfferings.filter((lo) => Boolean(lo.id) || Boolean(lo._tempId));

    if (allOfferings.length === 0) {
        return (
            <div className="alert alert-warning d-flex align-items-center gap-2 mt-3 mb-0 py-2">
                <em className="icon ni ni-alert-circle" />
                <span className="fs-12">
                    Lisans paketi fiyatı eklemek için önce <strong>Fiyatlandırma</strong> sekmesinde teklif oluşturun.
                </span>
            </div>
        );
    }

    return (
        <div className="mt-3 pt-3 border-top">
            <div className="d-flex align-items-center justify-content-between mb-2">
                <span className="overline-title text-soft fs-11">Lisans Paketi Fiyatları</span>
                <button
                    type="button"
                    className="btn btn-xs btn-outline-primary"
                    onClick={() => append({ ...EMPTY_OFFERING_PRICE })}
                >
                    <em className="icon ni ni-plus me-1" />
                    Fiyat Ekle
                </button>
            </div>

            {fields.length === 0 ? (
                <p className="text-soft fs-12 mb-0">Henüz fiyat tanımı yok. "Fiyat Ekle" ile lisans paketine özel fiyat ekleyin.</p>
            ) : (
                <div className="d-flex flex-column gap-2 h-100">
                    {fields.map((field, priceIndex) => (
                        <div key={field.id} className="card card-bordered bg-lighter">
                            <div className="card-inner py-2">
                                <div className="row g-2 align-items-end">
                                    <div className="col-md-4">
                                        <label className="form-label fs-12 mb-1">
                                            Lisans Paketi <span className="text-danger">*</span>
                                        </label>
                                        <select
                                            className="form-control form-select form-select-sm"
                                            value={
                                                watchedPrices[priceIndex]?.productLicenseOfferingId ||
                                                watchedPrices[priceIndex]?.licenseOfferingTempId ||
                                                ""
                                            }
                                            onChange={(e) => {
                                                const selectedKey = e.target.value;
                                                const offering = allOfferings.find(
                                                    (lo) => lo.id === selectedKey || lo._tempId === selectedKey
                                                );
                                                if (!offering) {
                                                    setValue(`modules.${moduleIndex}.offeringPrices.${priceIndex}.productLicenseOfferingId`, undefined, { shouldDirty: true });
                                                    setValue(`modules.${moduleIndex}.offeringPrices.${priceIndex}.licenseOfferingTempId`, undefined, { shouldDirty: true });
                                                } else if (offering.id) {
                                                    setValue(`modules.${moduleIndex}.offeringPrices.${priceIndex}.productLicenseOfferingId`, offering.id, { shouldDirty: true });
                                                    setValue(`modules.${moduleIndex}.offeringPrices.${priceIndex}.licenseOfferingTempId`, undefined, { shouldDirty: true });
                                                } else {
                                                    setValue(`modules.${moduleIndex}.offeringPrices.${priceIndex}.productLicenseOfferingId`, undefined, { shouldDirty: true });
                                                    setValue(`modules.${moduleIndex}.offeringPrices.${priceIndex}.licenseOfferingTempId`, offering._tempId, { shouldDirty: true });
                                                }
                                            }}
                                        >
                                            <option value="">— Seçiniz —</option>
                                            {allOfferings.map((lo) => (
                                                <option key={lo.id ?? lo._tempId} value={lo.id ?? lo._tempId ?? ""}>
                                                    {lo.name || "(İsimsiz Teklif)"}
                                                    {!lo.id && " 🆕"}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="col-md-3">
                                        <label className="form-label fs-12 mb-1">Fiyat</label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            className="form-control form-control-sm"
                                            placeholder="0.00"
                                            {...register(`modules.${moduleIndex}.offeringPrices.${priceIndex}.price`, { valueAsNumber: true })}
                                        />
                                    </div>
                                    <div className="col-md-2">
                                        <label className="form-label fs-12 mb-1">Para Birimi</label>
                                        <input
                                            className="form-control form-control-sm"
                                            placeholder="TRY"
                                            {...register(`modules.${moduleIndex}.offeringPrices.${priceIndex}.currencyCode`)}
                                        />
                                    </div>
                                    <div className="col-md-2 d-flex align-items-end pb-1">
                                        <div className="form-check form-switch">
                                            <input
                                                type="checkbox"
                                                className="form-check-input"
                                                id={`op-active-${moduleIndex}-${priceIndex}`}
                                                {...register(`modules.${moduleIndex}.offeringPrices.${priceIndex}.isActive`)}
                                            />
                                            <label className="form-check-label fs-12" htmlFor={`op-active-${moduleIndex}-${priceIndex}`}>
                                                Aktif
                                            </label>
                                        </div>
                                    </div>
                                    <div className="col-md-1 d-flex align-items-end justify-content-end">
                                        <button
                                            type="button"
                                            className="btn btn-xs btn-icon btn-outline-danger"
                                            onClick={() => remove(priceIndex)}
                                            title="Kaldır"
                                        >
                                            <em className="icon ni ni-trash" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

const ProductModulesTab: React.FC = () => {
    const {
        register,
        control,
        formState: { errors },
    } = useFormContext<ProductFormValues>();
    const { fields, append, remove } = useFieldArray({ control, name: "modules" });

    return (
        <div>
            <div className="d-flex align-items-center justify-content-between mb-3">
                <div>
                    <h6 className="overline-title text-primary mb-0">Ürün Modülleri</h6>
                    <p className="text-soft fs-12 mb-0">
                        CRM modülü, Raporlama modülü gibi ek modülleri ve lisans paketine göre fiyatlarını tanımlayın.
                    </p>
                </div>
                <button
                    type="button"
                    className="btn btn-sm btn-outline-primary"
                    onClick={() => append({ ...EMPTY_MODULE, sortOrder: fields.length + 1 })}
                >
                    <em className="icon ni ni-plus me-1" />
                    Modül Ekle
                </button>
            </div>

            {fields.length === 0 ? (
                <div className="text-center py-5 text-soft">
                    <em className="icon ni ni-package fs-2 d-block mb-2" />
                    <p className="mb-0">
                        Henüz modül eklenmemiş. Yazılım ürünleri için modül tanımlayabilirsiniz.
                    </p>
                </div>
            ) : (
                <div className="d-flex flex-column gap-3 h-100">
                    {fields.map((field, index) => (
                        <div key={field.id} className="card card-bordered">
                            <div className="card-inner">
                                <div className="d-flex align-items-center justify-content-between mb-3">
                                    <span className="badge bg-primary-soft text-primary">Modül #{index + 1}</span>
                                    <button
                                        type="button"
                                        className="btn btn-sm btn-icon btn-outline-danger"
                                        onClick={() => remove(index)}
                                        title="Modülü Kaldır"
                                    >
                                        <em className="icon ni ni-trash" />
                                    </button>
                                </div>
                                <div className="row g-3">
                                    <div className="col-md-3">
                                        <label className="form-label">
                                            Modül Kodu <span className="text-danger">*</span>
                                        </label>
                                        <input
                                            className="form-control"
                                            placeholder="MOD-CRM"
                                            {...register(`modules.${index}.moduleCode`)}
                                        />
                                        {errors.modules?.[index]?.moduleCode && (
                                            <span className="text-danger fs-12">
                                                {errors.modules[index]?.moduleCode?.message}
                                            </span>
                                        )}
                                    </div>
                                    <div className="col-md-5">
                                        <label className="form-label">
                                            Modül Adı <span className="text-danger">*</span>
                                        </label>
                                        <input
                                            className="form-control"
                                            placeholder="CRM Entegrasyonu"
                                            {...register(`modules.${index}.name`)}
                                        />
                                        {errors.modules?.[index]?.name && (
                                            <span className="text-danger fs-12">
                                                {errors.modules[index]?.name?.message}
                                            </span>
                                        )}
                                    </div>
                                    <div className="col-md-4">
                                        <label className="form-label">Para Birimi</label>
                                        <input
                                            className="form-control"
                                            placeholder="TRY"
                                            {...register(`modules.${index}.currencyCode`)}
                                        />
                                    </div>
                                    <div className="col-12">
                                        <label className="form-label">Açıklama</label>
                                        <input
                                            className="form-control"
                                            placeholder="Modül hakkında kısa açıklama..."
                                            {...register(`modules.${index}.description`)}
                                        />
                                    </div>
                                    <div className="col-md-2">
                                        <label className="form-label">Sıra</label>
                                        <input
                                            type="number"
                                            min="0"
                                            className="form-control"
                                            placeholder="1"
                                            {...register(`modules.${index}.sortOrder`, { valueAsNumber: true })}
                                        />
                                    </div>
                                    <div className="col-md-10 d-flex align-items-end pb-1 gap-4">
                                        <div className="form-check form-switch">
                                            <input
                                                type="checkbox"
                                                className="form-check-input"
                                                id={`mod-optional-${index}`}
                                                {...register(`modules.${index}.isOptional`)}
                                            />
                                            <label className="form-check-label" htmlFor={`mod-optional-${index}`}>
                                                Opsiyonel
                                            </label>
                                        </div>
                                        <div className="form-check form-switch">
                                            <input
                                                type="checkbox"
                                                className="form-check-input"
                                                id={`mod-active-${index}`}
                                                {...register(`modules.${index}.isActive`)}
                                            />
                                            <label className="form-check-label" htmlFor={`mod-active-${index}`}>
                                                Aktif
                                            </label>
                                        </div>
                                    </div>
                                </div>

                                {/* Lisans paketi bazlı fiyatlar */}
                                <ModuleOfferingPricesSection moduleIndex={index} />
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ProductModulesTab;
