import React from "react";
import { useFieldArray, useFormContext } from "react-hook-form";
import { ProductFormValues } from "@/modules/products/types/productEditor.types";

const LICENSE_MODELS = [
    { value: 1, label: "Tek Seferlik (Perpetual)" },
    { value: 2, label: "Abonelik (Subscription)" },
    { value: 3, label: "Kullanım Bazlı (Usage-Based)" },
    { value: 4, label: "Koltuk Bazlı (Seat-Based)" },
    { value: 5, label: "Deneme (Trial)" },
];

const EMPTY_TIER = {
    licenseModel: 4,
    unit: "kullanici",
    minUnits: 1,
    maxUnits: undefined as number | undefined,
    pricePerUnit: 0,
    flatFee: 0,
    currencyCode: "TRY",
    isActive: true,
};

const SoftwarePricingTiersTab: React.FC = () => {
    const {
        register,
        control,
        formState: { errors },
    } = useFormContext<ProductFormValues>();
    const { fields, append, remove } = useFieldArray({ control, name: "softwarePricingTiers" });

    return (
        <div>
            <div className="d-flex align-items-center justify-content-between mb-3">
                <div>
                    <h6 className="overline-title text-primary mb-0">Kademeli Fiyatlandırma</h6>
                    <p className="text-soft fs-12 mb-0">
                        Kullanıcı sayısı, istek sayısı gibi birimlere göre kademeli fiyat tanımlayın.
                    </p>
                </div>
                <button
                    type="button"
                    className="btn btn-sm btn-outline-primary"
                    onClick={() => append({ ...EMPTY_TIER })}
                >
                    <em className="icon ni ni-plus me-1" />
                    Kademe Ekle
                </button>
            </div>

            {fields.length === 0 ? (
                <div className="text-center py-5 text-soft">
                    <em className="icon ni ni-layers fs-2 d-block mb-2" />
                    <p className="mb-0">
                        Henüz fiyat kademesi eklenmemiş. Örn: 1-10 kullanıcı = 350 TL/kullanıcı, 11-50 kullanıcı = 280 TL/kullanıcı.
                    </p>
                </div>
            ) : (
                <div className="d-flex flex-column gap-3 h-100">
                    {fields.map((field, index) => (
                        <div key={field.id} className="card card-bordered">
                            <div className="card-inner">
                                <div className="d-flex align-items-center justify-content-between mb-3">
                                    <span className="badge bg-info-soft text-info">Kademe #{index + 1}</span>
                                    <button
                                        type="button"
                                        className="btn btn-sm btn-icon btn-outline-danger"
                                        onClick={() => remove(index)}
                                        title="Kademeyi Kaldır"
                                    >
                                        <em className="icon ni ni-trash" />
                                    </button>
                                </div>
                                <div className="row g-3">
                                    <div className="col-md-4">
                                        <label className="form-label">Lisans Modeli</label>
                                        <select
                                            className="form-control form-select"
                                            {...register(`softwarePricingTiers.${index}.licenseModel`, { valueAsNumber: true })}
                                        >
                                            {LICENSE_MODELS.map((lm) => (
                                                <option key={lm.value} value={lm.value}>
                                                    {lm.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="col-md-4">
                                        <label className="form-label">Birim</label>
                                        <input
                                            className="form-control"
                                            placeholder="kullanici, api-istek, gb..."
                                            {...register(`softwarePricingTiers.${index}.unit`)}
                                        />
                                    </div>
                                    <div className="col-md-4">
                                        <label className="form-label">Para Birimi</label>
                                        <input
                                            className="form-control"
                                            placeholder="TRY"
                                            {...register(`softwarePricingTiers.${index}.currencyCode`)}
                                        />
                                    </div>
                                    <div className="col-md-3">
                                        <label className="form-label">Min. Birim</label>
                                        <input
                                            type="number"
                                            min="0"
                                            className="form-control"
                                            placeholder="1"
                                            {...register(`softwarePricingTiers.${index}.minUnits`, { valueAsNumber: true })}
                                        />
                                        {errors.softwarePricingTiers?.[index]?.minUnits && (
                                            <span className="text-danger fs-12">
                                                {errors.softwarePricingTiers[index]?.minUnits?.message}
                                            </span>
                                        )}
                                    </div>
                                    <div className="col-md-3">
                                        <label className="form-label">Maks. Birim</label>
                                        <input
                                            type="number"
                                            min="0"
                                            className="form-control"
                                            placeholder="Sınırsız (boş bırakın)"
                                            {...register(`softwarePricingTiers.${index}.maxUnits`, { valueAsNumber: true })}
                                        />
                                    </div>
                                    <div className="col-md-3">
                                        <label className="form-label">Birim Fiyatı</label>
                                        <input
                                            type="number"
                                            step="0.0001"
                                            min="0"
                                            className="form-control"
                                            placeholder="0.0000"
                                            {...register(`softwarePricingTiers.${index}.pricePerUnit`, { valueAsNumber: true })}
                                        />
                                    </div>
                                    <div className="col-md-3">
                                        <label className="form-label">Sabit Ücret</label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            className="form-control"
                                            placeholder="0.00"
                                            {...register(`softwarePricingTiers.${index}.flatFee`, { valueAsNumber: true })}
                                        />
                                    </div>
                                    <div className="col-12">
                                        <div className="form-check form-switch">
                                            <input
                                                type="checkbox"
                                                className="form-check-input"
                                                id={`tier-active-${index}`}
                                                {...register(`softwarePricingTiers.${index}.isActive`)}
                                            />
                                            <label className="form-check-label" htmlFor={`tier-active-${index}`}>
                                                Aktif
                                            </label>
                                        </div>
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

export default SoftwarePricingTiersTab;
