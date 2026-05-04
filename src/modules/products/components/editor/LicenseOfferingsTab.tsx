import React from "react";
import { useFieldArray, useFormContext, useWatch } from "react-hook-form";
import { ProductFormValues } from "@/modules/products/types/productEditor.types";

const LICENSE_MODELS = [
    { value: 1, label: "Tek Seferlik (Perpetual)" },
    { value: 2, label: "Abonelik (Subscription)" },
    { value: 3, label: "Kullanım Bazlı (Usage-Based)" },
    { value: 4, label: "Koltuk Bazlı (Seat-Based)" },
    { value: 5, label: "Deneme (Trial)" },
];

const BILLING_UNITS = [
    { value: 1, label: "Gün" },
    { value: 2, label: "Hafta" },
    { value: 3, label: "Ay" },
    { value: 4, label: "Yıl" },
];

const EMPTY_OFFERING = {
    licenseModel: 2,
    name: "",
    description: "",
    basePrice: 0,
    currencyCode: "TRY",
    billingPeriodUnit: undefined as number | undefined,
    billingPeriodValue: undefined as number | undefined,
    autoRenew: true,
    gracePeriodDays: undefined as number | undefined,
    trialDays: undefined as number | undefined,
    convertToOfferingId: undefined as string | undefined,
    maxSeats: undefined as number | undefined,
    validFrom: undefined as string | undefined,
    validTo: undefined as string | undefined,
    isActive: true,
    sortOrder: 0,
};

interface OfferingRowProps {
    index: number;
    remove: (index: number) => void;
}

const OfferingRow: React.FC<OfferingRowProps> = ({ index, remove }) => {
    const {
        register,
        control,
        formState: { errors },
    } = useFormContext<ProductFormValues>();
    const licenseModel = useWatch({ control, name: `licenseOfferings.${index}.licenseModel` });
    const model = Number(licenseModel);

    const showBilling = model === 2;
    const showTrial = model === 5;
    const showSeats = model === 4;

    return (
        <div className="card card-bordered">
            <div className="card-inner h-100">
                <div className="d-flex align-items-center justify-content-between mb-3">
                    <span className="badge bg-warning-soft text-warning">Teklif #{index + 1}</span>
                    <button
                        type="button"
                        className="btn btn-sm btn-icon btn-outline-danger"
                        onClick={() => remove(index)}
                        title="Teklifi Kaldır"
                    >
                        <em className="icon ni ni-trash" />
                    </button>
                </div>
                <div className="row g-3">
                    <div className="col-md-4">
                        <label className="form-label">Lisans Modeli</label>
                        <select
                            className="form-control form-select"
                            {...register(`licenseOfferings.${index}.licenseModel`, { valueAsNumber: true })}
                        >
                            {LICENSE_MODELS.map((lm) => (
                                <option key={lm.value} value={lm.value}>
                                    {lm.label}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="col-md-5">
                        <label className="form-label">
                            Teklif Adı <span className="text-danger">*</span>
                        </label>
                        <input
                            className="form-control"
                            placeholder="Yıllık Abonelik"
                            {...register(`licenseOfferings.${index}.name`)}
                        />
                        {errors.licenseOfferings?.[index]?.name && (
                            <span className="text-danger fs-12">
                                {errors.licenseOfferings[index]?.name?.message}
                            </span>
                        )}
                    </div>
                    <div className="col-md-3">
                        <label className="form-label">Sıra</label>
                        <input
                            type="number"
                            min="0"
                            className="form-control"
                            placeholder="1"
                            {...register(`licenseOfferings.${index}.sortOrder`, { valueAsNumber: true })}
                        />
                    </div>
                    <div className="col-md-4">
                        <label className="form-label">
                            Taban Fiyat <span className="text-danger">*</span>
                        </label>
                        <input
                            type="number"
                            step="0.01"
                            min="0"
                            className="form-control"
                            placeholder="0.00"
                            {...register(`licenseOfferings.${index}.basePrice`, { valueAsNumber: true })}
                        />
                    </div>
                    <div className="col-md-3">
                        <label className="form-label">Para Birimi</label>
                        <input
                            className="form-control"
                            placeholder="TRY"
                            {...register(`licenseOfferings.${index}.currencyCode`)}
                        />
                    </div>
                    {showSeats && (
                        <div className="col-md-3">
                            <label className="form-label">Maks. Koltuk</label>
                            <input
                                type="number"
                                min="1"
                                className="form-control"
                                placeholder="Sınırsız"
                                {...register(`licenseOfferings.${index}.maxSeats`, { valueAsNumber: true })}
                            />
                        </div>
                    )}
                    {showBilling && (
                        <>
                            <div className="col-md-3">
                                <label className="form-label">Faturalama Periyodu</label>
                                <select
                                    className="form-control form-select"
                                    {...register(`licenseOfferings.${index}.billingPeriodUnit`, {
                                        valueAsNumber: true,
                                    })}
                                >
                                    <option value="">Seçiniz</option>
                                    {BILLING_UNITS.map((bu) => (
                                        <option key={bu.value} value={bu.value}>
                                            {bu.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="col-md-3">
                                <label className="form-label">Periyot Değeri</label>
                                <input
                                    type="number"
                                    min="1"
                                    className="form-control"
                                    placeholder="1"
                                    {...register(`licenseOfferings.${index}.billingPeriodValue`, {
                                        valueAsNumber: true,
                                    })}
                                />
                            </div>
                            <div className="col-md-3">
                                <label className="form-label">İzin Süresi (gün)</label>
                                <input
                                    type="number"
                                    min="0"
                                    className="form-control"
                                    placeholder="7"
                                    {...register(`licenseOfferings.${index}.gracePeriodDays`, {
                                        valueAsNumber: true,
                                    })}
                                />
                            </div>
                        </>
                    )}
                    {showTrial && (
                        <div className="col-md-3">
                            <label className="form-label">Deneme Süresi (gün)</label>
                            <input
                                type="number"
                                min="1"
                                className="form-control"
                                placeholder="30"
                                {...register(`licenseOfferings.${index}.trialDays`, { valueAsNumber: true })}
                            />
                        </div>
                    )}
                    <div className="col-12">
                        <label className="form-label">Açıklama</label>
                        <input
                            className="form-control"
                            placeholder="Teklif hakkında kısa açıklama..."
                            {...register(`licenseOfferings.${index}.description`)}
                        />
                    </div>
                    <div className="col-md-3">
                        <label className="form-label">Geçerlilik Başlangıcı</label>
                        <input
                            type="date"
                            className="form-control"
                            {...register(`licenseOfferings.${index}.validFrom`)}
                        />
                    </div>
                    <div className="col-md-3">
                        <label className="form-label">Geçerlilik Bitişi</label>
                        <input
                            type="date"
                            className="form-control"
                            {...register(`licenseOfferings.${index}.validTo`)}
                        />
                    </div>
                    <div className="col-md-6 d-flex align-items-end pb-1 gap-4">
                        {model !== 5 && (
                            <div className="form-check form-switch">
                                <input
                                    type="checkbox"
                                    className="form-check-input"
                                    id={`offering-autorenew-${index}`}
                                    {...register(`licenseOfferings.${index}.autoRenew`)}
                                />
                                <label className="form-check-label" htmlFor={`offering-autorenew-${index}`}>
                                    Otomatik Yenileme
                                </label>
                            </div>
                        )}
                        <div className="form-check form-switch">
                            <input
                                type="checkbox"
                                className="form-check-input"
                                id={`offering-active-${index}`}
                                {...register(`licenseOfferings.${index}.isActive`)}
                            />
                            <label className="form-check-label" htmlFor={`offering-active-${index}`}>
                                Aktif
                            </label>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const LicenseOfferingsTab: React.FC = () => {
    const { control } = useFormContext<ProductFormValues>();
    const { fields, append, remove } = useFieldArray({ control, name: "licenseOfferings" });

    return (
        <div>
            <div className="d-flex align-items-center justify-content-between mb-3">
                <div>
                    <h6 className="overline-title text-primary mb-0">Lisans Teklifleri</h6>
                    <p className="text-soft fs-12 mb-0">
                        Tek seferlik, abonelik, deneme gibi farklı satış tiplerini aynı üründe tanımlayın.
                    </p>
                </div>
                <button
                    type="button"
                    className="btn btn-sm btn-outline-primary"
                    onClick={() => append({ ...EMPTY_OFFERING, sortOrder: fields.length + 1 })}
                >
                    <em className="icon ni ni-plus me-1" />
                    Teklif Ekle
                </button>
            </div>

            {fields.length === 0 ? (
                <div className="text-center py-5 text-soft">
                    <em className="icon ni ni-tag fs-2 d-block mb-2" />
                    <p className="mb-0">
                        Henüz lisans teklifi eklenmemiş. Perpetual, Subscription ve Trial teklifleri aynı anda
                        eklenebilir.
                    </p>
                </div>
            ) : (
                <div className="d-flex flex-column gap-3">
                    {fields.map((field, index) => (
                        <OfferingRow key={field.id} index={index} remove={remove} />
                    ))}
                </div>
            )}
        </div>
    );
};

export default LicenseOfferingsTab;
