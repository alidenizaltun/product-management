import React, { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useFieldArray, useFormContext, useWatch } from "react-hook-form";
import { ProductFormValues } from "@/modules/products/types/productEditor.types";
import { productsApi } from "@/modules/products/api/products.api";
import { showApiError, showSuccess } from "@/modules/shared/components/NotificationAlert";
import { queryKeys } from "@/services/query/queryKeys";
import type { LicenseOfferingForm } from "@/modules/products/types/productEditor.types";

const generateTempId = () =>
    `temp_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

const LICENSE_MODELS = [
    { value: 1, label: "Tek Seferlik", icon: "package", color: "primary" },
    { value: 2, label: "Abonelik", icon: "repeat", color: "success" },
    { value: 3, label: "Kullanım Bazlı", icon: "activity", color: "info" },
    { value: 4, label: "Koltuk Bazlı", icon: "users", color: "warning" },
    { value: 5, label: "Deneme", icon: "clock", color: "secondary" },
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

const PLAN_TEMPLATES = [
    {
        title: "Aylık plan",
        description: "Her ay yenilenen standart abonelik.",
        icon: "repeat",
        offering: { licenseModel: 2, name: "Aylık Plan", billingPeriodUnit: 3, billingPeriodValue: 1 },
    },
    {
        title: "Yıllık plan",
        description: "Yıllık ödeme ve yenileme için.",
        icon: "calendar",
        offering: { licenseModel: 2, name: "Yıllık Plan", billingPeriodUnit: 4, billingPeriodValue: 1 },
    },
    {
        title: "Tek seferlik",
        description: "Kalıcı lisans veya tek ödeme.",
        icon: "package",
        offering: { licenseModel: 1, name: "Tek Seferlik Lisans", autoRenew: false },
    },
    {
        title: "Koltuk bazlı",
        description: "Kullanıcı/koltuk sayısına bağlı satış.",
        icon: "users",
        offering: { licenseModel: 4, name: "Koltuk Bazlı Plan", maxSeats: 10 },
    },
    {
        title: "Deneme",
        description: "Ücretsiz veya düşük fiyatlı deneme.",
        icon: "clock",
        offering: { licenseModel: 5, name: "Deneme Planı", basePrice: 0, trialDays: 14, autoRenew: false },
    },
];

const getModelMeta = (value?: number) =>
    LICENSE_MODELS.find((model) => model.value === Number(value)) ?? LICENSE_MODELS[1];

const formatMoney = (amount?: number, currency = "TRY") =>
    typeof amount === "number" && Number.isFinite(amount)
        ? `${amount.toLocaleString("tr-TR")} ${currency}`
        : `0 ${currency}`;

interface OfferingFieldsProps {
    index: number;
    fieldId: string;
    productId?: string;
    saving: boolean;
    onRemove: () => void;
    onMoveUp: () => void;
    onMoveDown: () => void;
    onSave: () => void;
    canMoveUp: boolean;
    canMoveDown: boolean;
}

const OfferingFields: React.FC<OfferingFieldsProps> = ({
    index,
    fieldId,
    productId,
    saving,
    onRemove,
    onMoveUp,
    onMoveDown,
    onSave,
    canMoveUp,
    canMoveDown,
}) => {
    const {
        register,
        control,
        getValues,
        formState: { errors },
    } = useFormContext<ProductFormValues>();
    const [advancedOpen, setAdvancedOpen] = useState(false);
    const offering = useWatch({ control, name: `licenseOfferings.${index}` });
    const model = Number(offering?.licenseModel ?? 2);
    const meta = getModelMeta(model);

    const showBilling = model === 2;
    const showTrial = model === 5;
    const showSeats = model === 4;
    const saved = Boolean(offering?.id);

    return (
        <div className={`card card-bordered border-${meta.color}`}>
            <div className="card-inner">
                <div className="d-flex flex-wrap justify-content-between align-items-start gap-3 mb-3 h-100">
                    <div className="d-flex align-items-start gap-3 h-100">
                        <span className={`btn btn-icon btn-${meta.color} rounded-circle flex-shrink-0`}>
                            <em className={`icon ni ni-${meta.icon}`} />
                        </span>
                        <div>
                            <span className={`badge badge-dim bg-${meta.color} mb-1`}>{meta.label}</span>
                            <h6 className="title mb-0">{offering?.name || `Plan #${index + 1}`}</h6>
                            <p className="text-soft fs-12px mb-0">{formatMoney(offering?.basePrice, offering?.currencyCode)}</p>
                        </div>
                    </div>

                    <div className="d-flex gap-1 h-100">
                        <button
                            type="button"
                            className="btn btn-sm btn-icon btn-outline-light"
                            disabled={!canMoveUp}
                            onClick={onMoveUp}
                            title="Yukarı taşı"
                        >
                            <em className="icon ni ni-chevron-up" />
                        </button>
                        <button
                            type="button"
                            className="btn btn-sm btn-icon btn-outline-light"
                            disabled={!canMoveDown}
                            onClick={onMoveDown}
                            title="Aşağı taşı"
                        >
                            <em className="icon ni ni-chevron-down" />
                        </button>
                        <button
                            type="button"
                            className="btn btn-sm btn-icon btn-outline-danger"
                            onClick={onRemove}
                            title="Teklifi Kaldır"
                        >
                            <em className="icon ni ni-trash" />
                        </button>
                    </div>
                </div>

                <div className="row g-3 align-items-end">
                    <div className="col-lg-4">
                        <label className="form-label">
                            Plan adı <span className="text-danger">*</span>
                        </label>
                        <input
                            className="form-control form-control-lg"
                            placeholder="Yıllık Abonelik"
                            {...register(`licenseOfferings.${index}.name`)}
                        />
                        {errors.licenseOfferings?.[index]?.name && (
                            <span className="text-danger fs-12">
                                {errors.licenseOfferings[index]?.name?.message}
                            </span>
                        )}
                    </div>

                    <div className="col-lg-5">
                        <label className="form-label">
                            Taban fiyat <span className="text-danger">*</span>
                        </label>
                        <div className="input-group input-group-lg">
                            <input
                                type="number"
                                step="0.01"
                                min="0"
                                className="form-control"
                                placeholder="0.00"
                                {...register(`licenseOfferings.${index}.basePrice`, { valueAsNumber: true })}
                            />
                            <select
                                className="form-select"
                                style={{ maxWidth: 120 }}
                                {...register(`licenseOfferings.${index}.currencyCode`)}
                            >
                                <option value="TRY">TRY</option>
                                <option value="USD">USD</option>
                                <option value="EUR">EUR</option>
                                <option value="GBP">GBP</option>
                            </select>
                        </div>
                        {errors.licenseOfferings?.[index]?.basePrice && (
                            <span className="text-danger fs-12">
                                {errors.licenseOfferings[index]?.basePrice?.message}
                            </span>
                        )}
                    </div>

                    <div className="col-lg-3">
                        <button
                            type="button"
                            className="btn btn-outline-light w-100 py-2"
                            onClick={() => setAdvancedOpen((current) => !current)}
                        >
                            <em className={`icon ni ni-chevron-${advancedOpen ? "up" : "down"} me-1`} />
                            Detaylar
                        </button>
                    </div>

                    <div className="col-md-4">
                        <label className="form-label">Satış modeli</label>
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

                    {showBilling && (
                        <>
                            <div className="col-md-4">
                                <label className="form-label">Faturalama</label>
                                <select
                                    className="form-control form-select"
                                    {...register(`licenseOfferings.${index}.billingPeriodUnit`, { valueAsNumber: true })}
                                >
                                    <option value="">Seçiniz</option>
                                    {BILLING_UNITS.map((bu) => (
                                        <option key={bu.value} value={bu.value}>
                                            {bu.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="col-md-4">
                                <label className="form-label">Periyot</label>
                                <input
                                    type="number"
                                    min="1"
                                    className="form-control"
                                    placeholder="1"
                                    {...register(`licenseOfferings.${index}.billingPeriodValue`, { valueAsNumber: true })}
                                />
                            </div>
                        </>
                    )}

                    {showSeats && (
                        <div className="col-md-4">
                            <label className="form-label">Maks. koltuk</label>
                            <input
                                type="number"
                                min="1"
                                className="form-control"
                                placeholder="Sınırsız"
                                {...register(`licenseOfferings.${index}.maxSeats`, { valueAsNumber: true })}
                            />
                        </div>
                    )}

                    {showTrial && (
                        <div className="col-md-4">
                            <label className="form-label">Deneme süresi</label>
                            <div className="input-group">
                                <input
                                    type="number"
                                    min="1"
                                    className="form-control"
                                    placeholder="14"
                                    {...register(`licenseOfferings.${index}.trialDays`, { valueAsNumber: true })}
                                />
                                <span className="input-group-text">gün</span>
                            </div>
                        </div>
                    )}

                    {advancedOpen && (
                        <>
                            <div className="col-12">
                                <label className="form-label">Açıklama</label>
                                <input
                                    className="form-control"
                                    placeholder="Plan hakkında kısa açıklama..."
                                    {...register(`licenseOfferings.${index}.description`)}
                                />
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

                            <div className="col-md-3">
                                <label className="form-label">İzin süresi</label>
                                <div className="input-group">
                                    <input
                                        type="number"
                                        min="0"
                                        className="form-control"
                                        placeholder="7"
                                        {...register(`licenseOfferings.${index}.gracePeriodDays`, { valueAsNumber: true })}
                                    />
                                    <span className="input-group-text">gün</span>
                                </div>
                            </div>

                            <div className="col-md-3">
                                <label className="form-label">Başlangıç</label>
                                <input
                                    type="date"
                                    className="form-control"
                                    {...register(`licenseOfferings.${index}.validFrom`)}
                                />
                            </div>
                            <div className="col-md-3">
                                <label className="form-label">Bitiş</label>
                                <input
                                    type="date"
                                    className={`form-control ${errors.licenseOfferings?.[index]?.validTo ? "is-invalid" : ""}`}
                                    {...register(`licenseOfferings.${index}.validTo`, {
                                        validate: (value) => {
                                            const from = getValues(`licenseOfferings.${index}.validFrom`);
                                            if (from && value && value < from) {
                                                return "Bitiş tarihi başlangıç tarihinden önce olamaz";
                                            }
                                            return true;
                                        },
                                    })}
                                />
                                {errors.licenseOfferings?.[index]?.validTo && (
                                    <div className="invalid-feedback">
                                        {errors.licenseOfferings[index]?.validTo?.message}
                                    </div>
                                )}
                            </div>
                        </>
                    )}

                    <div className="col-12 d-flex flex-wrap gap-4">
                        {model !== 5 && (
                            <div className="form-check form-switch">
                                <input
                                    type="checkbox"
                                    className="form-check-input"
                                    id={`offering-autorenew-${fieldId}`}
                                    {...register(`licenseOfferings.${index}.autoRenew`)}
                                />
                                <label className="form-check-label" htmlFor={`offering-autorenew-${fieldId}`}>
                                    Otomatik yenile
                                </label>
                            </div>
                        )}
                        <div className="form-check form-switch">
                            <input
                                type="checkbox"
                                className="form-check-input"
                                id={`offering-active-${fieldId}`}
                                {...register(`licenseOfferings.${index}.isActive`)}
                            />
                            <label className="form-check-label" htmlFor={`offering-active-${fieldId}`}>
                                Aktif
                            </label>
                        </div>
                    </div>

                    <div className="col-12 d-flex flex-wrap justify-content-end align-items-center gap-2 border-top pt-3 h-100">
                        <button
                            type="button"
                            className="btn btn-primary"
                            disabled={!productId || saving}
                            onClick={onSave}
                            title={!productId ? "Plan kaydetmek için önce ürünü kaydedin" : undefined}
                        >
                            {saving ? (
                                <>
                                    <span className="spinner-border spinner-border-sm me-2" />
                                    Kaydediliyor...
                                </>
                            ) : (
                                <>
                                    <em className={`icon ni ni-${saved ? "save" : "plus"} me-1`} />
                                    {saved ? "Planı Güncelle" : "Plan Ekle"}
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

interface LicenseOfferingsTabProps {
    productId?: string;
}

const toOptionalNumber = (value?: number) =>
    typeof value === "number" && Number.isFinite(value) ? value : undefined;

const toOptionalString = (value?: string | null) => {
    const trimmed = value?.trim();
    return trimmed || undefined;
};

const buildOfferingPayload = (offering: LicenseOfferingForm) => ({
    licenseModel: Number(offering.licenseModel ?? 2),
    name: offering.name?.trim() || "Yeni Plan",
    description: toOptionalString(offering.description),
    basePrice: toOptionalNumber(offering.basePrice) ?? 0,
    currencyCode: offering.currencyCode?.trim() || "TRY",
    billingPeriodUnit: toOptionalNumber(offering.billingPeriodUnit),
    billingPeriodValue: toOptionalNumber(offering.billingPeriodValue),
    autoRenew: Boolean(offering.autoRenew),
    gracePeriodDays: toOptionalNumber(offering.gracePeriodDays),
    trialDays: toOptionalNumber(offering.trialDays),
    convertToOfferingId: toOptionalString(offering.convertToOfferingId),
    maxSeats: toOptionalNumber(offering.maxSeats),
    validFrom: toOptionalString(offering.validFrom),
    validTo: toOptionalString(offering.validTo),
    isActive: Boolean(offering.isActive),
    sortOrder: toOptionalNumber(offering.sortOrder) ?? 0,
});

const LicenseOfferingsTab: React.FC<LicenseOfferingsTabProps> = ({ productId }) => {
    const queryClient = useQueryClient();
    const { control, getValues, setValue, trigger } = useFormContext<ProductFormValues>();
    const { fields, append, remove, swap } = useFieldArray({ control, name: "licenseOfferings" });
    const [savingIndex, setSavingIndex] = useState<number | null>(null);

    const addTemplate = (template: typeof PLAN_TEMPLATES[number]) => {
        append({
            ...EMPTY_OFFERING,
            ...template.offering,
            _tempId: generateTempId(),
            sortOrder: fields.length + 1,
        });
    };

    const saveOffering = async (index: number) => {
        if (!productId) return;

        const valid = await trigger([
            `licenseOfferings.${index}.name`,
            `licenseOfferings.${index}.basePrice`,
            `licenseOfferings.${index}.validTo`,
        ]);
        if (!valid) return;

        const offering = getValues(`licenseOfferings.${index}`);
        const payload = buildOfferingPayload(offering);

        try {
            setSavingIndex(index);
            if (offering.id) {
                await productsApi.updateLicenseOffering(productId, offering.id, payload);
                showSuccess("Satış planı güncellendi.");
            } else {
                const created = await productsApi.createLicenseOffering(productId, payload);
                setValue(`licenseOfferings.${index}.id`, created.id, { shouldDirty: false });
                setValue(`licenseOfferings.${index}._tempId`, undefined, { shouldDirty: false });
                showSuccess("Satış planı eklendi.");
            }

            await queryClient.invalidateQueries({ queryKey: queryKeys.products.detail(productId) });
            await queryClient.invalidateQueries({ queryKey: queryKeys.products.all });
        } catch (error) {
            showApiError(error);
        } finally {
            setSavingIndex(null);
        }
    };

    return (
        <div>
            <div className="d-flex align-items-start justify-content-between gap-3 mb-3 h-100">
                <div>
                    <h6 className="overline-title text-primary mb-0">Satış Planları</h6>
                    <p className="text-soft fs-12 mb-0">
                        Abonelik, deneme, koltuk bazlı veya tek seferlik satış planını şablonla oluşturun.
                    </p>
                </div>
                <button
                    type="button"
                    className="btn btn-sm btn-outline-primary"
                    onClick={() => append({ ...EMPTY_OFFERING, _tempId: generateTempId(), sortOrder: fields.length + 1 })}
                >
                    <em className="icon ni ni-plus me-1" />
                    Boş plan
                </button>
            </div>

            <div className="row g-3 mb-4">
                {PLAN_TEMPLATES.map((template) => (
                    <div className="col-sm-6 col-xl" key={template.title}>
                        <button
                            type="button"
                            className="card card-bordered h-100 w-100 bg-white text-start"
                            onClick={() => addTemplate(template)}
                        >
                            <div className="card-inner">
                                <span className="btn btn-icon btn-light rounded-circle mb-3">
                                    <em className={`icon ni ni-${template.icon}`} />
                                </span>
                                <h6 className="title mb-1">{template.title}</h6>
                                <p className="text-soft fs-12px mb-0">{template.description}</p>
                            </div>
                        </button>
                    </div>
                ))}
            </div>

            {fields.length === 0 ? (
                <div className="text-center py-5 text-soft">
                    <em className="icon ni ni-tag fs-2 d-block mb-2" />
                    <p className="mb-0">
                        Henüz plan eklenmedi. Yukarıdaki şablonlardan biriyle başlayın.
                    </p>
                </div>
            ) : (
                <div className="d-flex flex-column gap-3 h-100">
                    {fields.map((field, index) => (
                        <OfferingFields
                            key={field.id}
                            index={index}
                            fieldId={field.id}
                            productId={productId}
                            saving={savingIndex === index}
                            onRemove={() => remove(index)}
                            onMoveUp={() => swap(index, index - 1)}
                            onMoveDown={() => swap(index, index + 1)}
                            onSave={() => void saveOffering(index)}
                            canMoveUp={index > 0}
                            canMoveDown={index < fields.length - 1}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default LicenseOfferingsTab;
