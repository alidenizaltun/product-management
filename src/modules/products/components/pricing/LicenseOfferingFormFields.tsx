import React, { useId, useState } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import { Collapse, UncontrolledTooltip } from "reactstrap";
import { ProductFormValues } from "@/modules/products/types/productEditor.types";
import { BILLING_UNITS, getBillingPeriodValueForUnit } from "@/modules/products/utils/billingPeriod";
import { DEFAULT_CURRENCY_CODE } from "@/shared/config/currency";

export interface AssignableProductUnit {
    id?: string;
    _tempId?: string;
    code?: string;
    name?: string;
    isActive?: boolean;
}

export const generateOfferingTempId = () => `temp_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

export const LICENSE_MODELS = [
    { value: 1, label: "Tek Seferlik", icon: "package", color: "primary" },
    { value: 2, label: "Abonelik", icon: "repeat", color: "success" },
    { value: 5, label: "Deneme", icon: "clock", color: "secondary" },
];

export const EMPTY_OFFERING = {
    productUnitIds: [] as string[],
    productUnitTempIds: [] as string[],
    licenseModel: 2,
    name: "",
    description: "",
    basePrice: 0,
    currencyCode: DEFAULT_CURRENCY_CODE,
    billingPeriodUnit: undefined as number | undefined,
    billingPeriodValue: undefined as number | undefined,
    autoRenew: true,
    gracePeriodDays: undefined as number | undefined,
    trialDays: undefined as number | undefined,
    convertToOfferingId: undefined as string | undefined,
    validFrom: undefined as string | undefined,
    validTo: undefined as string | undefined,
    isActive: true,
    sortOrder: 0,
};

/** Plan oluşturmayı hızlandıran hazır başlangıç noktaları; seçilince ilgili alanları otomatik doldurur. */
export const PLAN_TEMPLATES: Array<{
    title: string;
    description: string;
    icon: string;
    offering: Partial<typeof EMPTY_OFFERING>;
}> = [
    {
        title: "Aylık plan",
        description: "Aylık dönemli standart abonelik.",
        icon: "repeat",
        offering: { licenseModel: 2, name: "Aylık Plan", billingPeriodUnit: 3, billingPeriodValue: 30 },
    },
    {
        title: "Yıllık plan",
        description: "Yıllık ödeme dönemine uygun plan.",
        icon: "calendar",
        offering: { licenseModel: 2, name: "Yıllık Plan", billingPeriodUnit: 4, billingPeriodValue: 365 },
    },
    {
        title: "Tek seferlik",
        description: "Kalıcı lisans veya tek ödeme.",
        icon: "package",
        offering: { licenseModel: 1, name: "Tek Seferlik Lisans", autoRenew: false },
    },
    {
        title: "Deneme",
        description: "Ücretsiz veya düşük fiyatlı deneme.",
        icon: "clock",
        offering: { licenseModel: 5, name: "Deneme Planı", basePrice: 0, trialDays: 14, autoRenew: false },
    },
];

export const getModelMeta = (value?: number) =>
    LICENSE_MODELS.find((model) => model.value === Number(value)) ?? LICENSE_MODELS[1];

export const normalizeLicenseModel = (value?: number) => {
    const model = Number(value ?? 2);
    return LICENSE_MODELS.some((item) => item.value === model) ? model : 2;
};

export const formatMoney = (amount?: number, currency = DEFAULT_CURRENCY_CODE) =>
    typeof amount === "number" && Number.isFinite(amount)
        ? `${amount.toLocaleString("tr-TR")} ${currency}`
        : `0 ${currency}`;

export const toUnitScopeValues = (ids?: Array<string | null | undefined>, tempIds?: Array<string | null | undefined>) => [
    ...(ids ?? []).filter(Boolean).map((id) => `id:${id}`),
    ...(tempIds ?? []).filter(Boolean).map((id) => `temp:${id}`),
];

export const splitUnitScopeValues = (values: string[]) => {
    const productUnitIds = values
        .filter((value) => value.startsWith("id:"))
        .map((value) => value.replace("id:", ""))
        .filter(Boolean);

    const productUnitTempIds = values
        .filter((value) => value.startsWith("temp:"))
        .map((value) => value.replace("temp:", ""))
        .filter(Boolean);

    return {
        productUnitIds,
        productUnitTempIds,
        productUnitId: productUnitIds[0],
        productUnitTempId: productUnitIds.length === 0 ? productUnitTempIds[0] : undefined,
    };
};

export const buildOfferingPayload = (offering: {
    productUnitIds?: string[];
    productUnitId?: string;
    licenseModel?: number;
    name?: string;
    description?: string;
    basePrice?: number;
    currencyCode?: string;
    billingPeriodUnit?: number;
    billingPeriodValue?: number;
    autoRenew?: boolean;
    gracePeriodDays?: number;
    trialDays?: number;
    convertToOfferingId?: string;
    validFrom?: string;
    validTo?: string;
    isActive?: boolean;
    sortOrder?: number;
}) => {
    const toOptionalNumber = (value?: number) => (typeof value === "number" && Number.isFinite(value) ? value : undefined);
    const toOptionalString = (value?: string | null) => value?.trim() || undefined;
    const productUnitIds = (offering.productUnitIds?.length ? offering.productUnitIds : offering.productUnitId ? [offering.productUnitId] : [])
        .filter(Boolean);

    return {
        productUnitId: productUnitIds[0] || undefined,
        productUnitIds: productUnitIds.length ? productUnitIds : undefined,
        licenseModel: normalizeLicenseModel(offering.licenseModel),
        name: offering.name?.trim() || "Yeni Plan",
        description: toOptionalString(offering.description),
        basePrice: toOptionalNumber(offering.basePrice) ?? 0,
        currencyCode: offering.currencyCode?.trim() || DEFAULT_CURRENCY_CODE,
        billingPeriodUnit: toOptionalNumber(offering.billingPeriodUnit),
        billingPeriodValue: toOptionalNumber(offering.billingPeriodValue),
        autoRenew: Boolean(offering.autoRenew),
        gracePeriodDays: toOptionalNumber(offering.gracePeriodDays),
        trialDays: toOptionalNumber(offering.trialDays),
        convertToOfferingId: toOptionalString(offering.convertToOfferingId),
        validFrom: toOptionalString(offering.validFrom),
        validTo: toOptionalString(offering.validTo),
        isActive: Boolean(offering.isActive),
        sortOrder: toOptionalNumber(offering.sortOrder) ?? 0,
    };
};

interface HelpLabelProps {
    children: React.ReactNode;
    help: string;
}

export const HelpLabel: React.FC<HelpLabelProps> = ({ children, help }) => {
    const reactId = useId();
    const id = `offering-help-${reactId.replace(/[^a-zA-Z0-9_-]/g, "")}`;

    return (
        <span className="d-inline-flex align-items-center gap-1">
            <span>{children}</span>
            <button
                type="button"
                id={id}
                className="btn btn-xs btn-trigger btn-icon text-soft p-0"
                aria-label={`${children} hakkında bilgi`}
                onClick={(event) => event.preventDefault()}
            >
                <em className="icon ni ni-info" />
            </button>
            <UncontrolledTooltip autohide={false} placement="top" target={id}>
                {help}
            </UncontrolledTooltip>
        </span>
    );
};

interface LicenseOfferingFormFieldsProps {
    index: number;
    fieldId: string;
    availableProductUnits: AssignableProductUnit[];
    onOpenUnitModal: () => void;
    firstFieldRef?: React.Ref<HTMLInputElement>;
}

/**
 * Bir satış planının form alanları. Yeni plan için önce şablon seçtirir (isim,
 * satış modeli ve faturalama otomatik dolar); ekranda daima sadece Plan adı,
 * Taban fiyat ve Birim seçimi görünür, geri kalan her şey "Detaylar" altındadır.
 */
const LicenseOfferingFormFields: React.FC<LicenseOfferingFormFieldsProps> = ({
    index,
    fieldId,
    availableProductUnits,
    onOpenUnitModal,
    firstFieldRef,
}) => {
    const {
        register,
        control,
        getValues,
        setValue,
        setFocus,
        formState: { errors },
    } = useFormContext<ProductFormValues>();
    const offering = useWatch({ control, name: `licenseOfferings.${index}` });
    const isNewPlan = !offering?.id;
    const [templateApplied, setTemplateApplied] = useState(false);
    const [advancedOpen, setAdvancedOpen] = useState(false);
    const showTemplatePicker = isNewPlan && !templateApplied;

    const model = Number(offering?.licenseModel ?? 2);
    const normalizedModel = normalizeLicenseModel(model);
    const meta = getModelMeta(normalizedModel);
    const showBilling = normalizedModel === 2;
    const showTrial = normalizedModel === 5;

    const assignableProductUnits = availableProductUnits.filter((unit) => unit.isActive !== false && (unit.id || unit._tempId));
    const selectedUnitValues = toUnitScopeValues(
        offering?.productUnitIds?.length ? offering.productUnitIds : offering?.productUnitId ? [offering.productUnitId] : [],
        offering?.productUnitTempIds?.length
            ? offering.productUnitTempIds
            : offering?.productUnitTempId
                ? [offering.productUnitTempId]
                : []
    );

    React.useEffect(() => {
        if (model !== normalizedModel) {
            setValue(`licenseOfferings.${index}.licenseModel`, normalizedModel, { shouldDirty: true });
        }
        if (normalizedModel !== 2) {
            setValue(`licenseOfferings.${index}.billingPeriodUnit`, undefined, { shouldDirty: true });
            setValue(`licenseOfferings.${index}.billingPeriodValue`, undefined, { shouldDirty: true });
            setValue(`licenseOfferings.${index}.gracePeriodDays`, undefined, { shouldDirty: true });
        }
    }, [index, model, normalizedModel, setValue]);

    const changeProductUnit = (value: string, checked: boolean) => {
        const values = checked ? [...selectedUnitValues, value] : selectedUnitValues.filter((item) => item !== value);
        const scope = splitUnitScopeValues([...new Set(values)]);

        setValue(`licenseOfferings.${index}.productUnitIds`, scope.productUnitIds, { shouldDirty: true });
        setValue(`licenseOfferings.${index}.productUnitTempIds`, scope.productUnitTempIds, { shouldDirty: true });
        setValue(`licenseOfferings.${index}.productUnitId`, scope.productUnitId, { shouldDirty: true });
        setValue(`licenseOfferings.${index}.productUnitTempId`, scope.productUnitTempId, { shouldDirty: true });
    };

    const applyTemplate = (template: typeof PLAN_TEMPLATES[number]) => {
        const current = getValues(`licenseOfferings.${index}`);
        setValue(`licenseOfferings.${index}`, { ...current, ...template.offering }, { shouldDirty: true });
        setTemplateApplied(true);
        window.setTimeout(() => setFocus(`licenseOfferings.${index}.basePrice`), 50);
    };

    const skipTemplate = () => {
        setTemplateApplied(true);
        window.setTimeout(() => setFocus(`licenseOfferings.${index}.name`), 50);
    };

    if (showTemplatePicker) {
        return (
            <div>
                <p className="text-soft fs-13px mb-3">
                    Hızlı başlamak için bir şablon seçin; adı, satış modelini ve faturalama bilgilerini otomatik doldurur. İstediğiniz
                    zaman aşağıdan değiştirebilirsiniz.
                </p>
                <div className="row g-3">
                    {PLAN_TEMPLATES.map((template) => (
                        <div className="col-sm-6" key={template.title}>
                            <button
                                type="button"
                                className="card card-bordered h-100 w-100 bg-white text-start pricing-template-card"
                                onClick={() => applyTemplate(template)}
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
                    <div className="col-12">
                        <button type="button" className="btn btn-outline-light w-100" onClick={skipTemplate}>
                            Boş plan ile devam et
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="row g-3">
            <input type="hidden" {...register(`licenseOfferings.${index}.sortOrder`, { valueAsNumber: true })} />
            <input type="hidden" {...register(`licenseOfferings.${index}.currencyCode`)} />

            <div className="col-lg-7">
                <label className="form-label">
                    <HelpLabel help="Müşterinin satın alacağı paketin görünen adıdır. Aylık Plan, Yıllık Plan veya Kurumsal Paket gibi satışta anlaşılır bir ad kullanın.">
                        Plan adı
                    </HelpLabel>{" "}
                    <span className="text-danger">*</span>
                </label>
                <input
                    ref={firstFieldRef}
                    className="form-control form-control-lg"
                    placeholder="Yıllık Abonelik"
                    {...register(`licenseOfferings.${index}.name`)}
                />
                {errors.licenseOfferings?.[index]?.name && (
                    <span className="text-danger fs-12">{errors.licenseOfferings[index]?.name?.message}</span>
                )}
            </div>
            <div className="col-lg-5">
                <label className="form-label">
                    <HelpLabel help="Bu satış planının dinamik kurallar çalışmadan önceki başlangıç fiyatıdır.">
                        Taban fiyat
                    </HelpLabel>{" "}
                    <span className="text-danger">*</span>
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
                    <span className="input-group-text">{offering?.currencyCode || DEFAULT_CURRENCY_CODE}</span>
                </div>
                {errors.licenseOfferings?.[index]?.basePrice && (
                    <span className="text-danger fs-12">{errors.licenseOfferings[index]?.basePrice?.message}</span>
                )}
            </div>

            <div className="col-12">
                <div className="d-flex align-items-center justify-content-between">
                    <span className="overline-title text-primary">Birim seçimi</span>
                    <button type="button" className="btn btn-sm btn-outline-primary btn-icon" onClick={onOpenUnitModal} title="Evrensel birimden ekle">
                        <em className="icon ni ni-plus" />
                    </button>
                </div>
                <div className="pricing-unit-dropzone mt-1">
                    <div className="form-check">
                        <input
                            type="checkbox"
                            className="form-check-input"
                            id={`offering-unit-default-${fieldId}`}
                            checked={selectedUnitValues.length === 0}
                            onChange={() => {
                                const scope = splitUnitScopeValues([]);
                                setValue(`licenseOfferings.${index}.productUnitIds`, scope.productUnitIds, { shouldDirty: true });
                                setValue(`licenseOfferings.${index}.productUnitTempIds`, scope.productUnitTempIds, { shouldDirty: true });
                                setValue(`licenseOfferings.${index}.productUnitId`, scope.productUnitId, { shouldDirty: true });
                                setValue(`licenseOfferings.${index}.productUnitTempId`, scope.productUnitTempId, { shouldDirty: true });
                            }}
                        />
                        <label className="form-check-label" htmlFor={`offering-unit-default-${fieldId}`}>
                            Birimsiz paket
                        </label>
                    </div>
                    {assignableProductUnits.map((unit) => {
                        const optionValue = unit.id ? `id:${unit.id}` : `temp:${unit._tempId}`;
                        return (
                            <div className="form-check" key={optionValue}>
                                <input
                                    type="checkbox"
                                    className="form-check-input"
                                    id={`offering-unit-${fieldId}-${optionValue}`}
                                    checked={selectedUnitValues.includes(optionValue)}
                                    onChange={(event) => changeProductUnit(optionValue, event.target.checked)}
                                />
                                <label className="form-check-label" htmlFor={`offering-unit-${fieldId}-${optionValue}`}>
                                    {unit.name || unit.code}
                                    {!unit.id ? " (kaydedilecek)" : ""}
                                </label>
                            </div>
                        );
                    })}
                    {assignableProductUnits.length === 0 && (
                        <span className="text-soft fs-12px">Henüz birim eklenmedi. + butonuyla ekleyebilirsiniz.</span>
                    )}
                </div>
            </div>

            <div className="col-12 d-flex flex-wrap align-items-center justify-content-between gap-2 mt-1">
                <div className="form-check form-switch mb-0">
                    <input type="checkbox" className="form-check-input" id={`offering-active-${fieldId}`} {...register(`licenseOfferings.${index}.isActive`)} />
                    <label className="form-check-label" htmlFor={`offering-active-${fieldId}`}>
                        Plan aktif
                    </label>
                </div>
                <button type="button" className="btn btn-sm btn-outline-light" onClick={() => setAdvancedOpen((current) => !current)}>
                    <em className={`icon ni ni-chevron-${advancedOpen ? "up" : "down"} me-1`} />
                    Detaylar
                </button>
            </div>

            <div className="col-12">
                <Collapse isOpen={advancedOpen}>
                    <div className="row g-3 pt-2 border-top">
                        <div className="col-md-6">
                            <label className="form-label">
                                <HelpLabel help="Planın hangi satış mantığıyla sunulacağını belirler. Abonelik dönemsel yenileme, tek seferlik kalıcı lisans, deneme ise geçici erişim senaryosu içindir.">
                                    Satış modeli
                                </HelpLabel>
                            </label>
                            <select className="form-control form-select" {...register(`licenseOfferings.${index}.licenseModel`, { valueAsNumber: true })}>
                                {LICENSE_MODELS.map((lm) => (
                                    <option key={lm.value} value={lm.value}>
                                        {lm.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                        {showBilling && (
                            <>
                                <div className="col-md-3">
                                    <label className="form-label">Faturalama birimi</label>
                                    <select
                                        className="form-control form-select"
                                        {...register(`licenseOfferings.${index}.billingPeriodUnit`, {
                                            valueAsNumber: true,
                                            onChange: (event) => {
                                                const nextValue = getBillingPeriodValueForUnit(event.target.value);
                                                setValue(`licenseOfferings.${index}.billingPeriodValue`, nextValue, { shouldDirty: true });
                                            },
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
                                    <label className="form-label">Fatura periyodu</label>
                                    <input
                                        type="number"
                                        min="1"
                                        className="form-control"
                                        placeholder="1"
                                        {...register(`licenseOfferings.${index}.billingPeriodValue`, { valueAsNumber: true })}
                                    />
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label">Ödeme toleransı</label>
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
                                <div className="col-md-6">
                                    <div className="form-check form-switch mt-4">
                                        <input
                                            type="checkbox"
                                            className="form-check-input"
                                            id={`offering-autorenew-${fieldId}`}
                                            {...register(`licenseOfferings.${index}.autoRenew`)}
                                        />
                                        <label className="form-check-label" htmlFor={`offering-autorenew-${fieldId}`}>
                                            Otomatik yenileme
                                        </label>
                                    </div>
                                </div>
                            </>
                        )}
                        {showTrial && (
                            <div className="col-md-6">
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
                        <div className="col-12">
                            <label className="form-label">Plan açıklaması</label>
                            <input
                                className="form-control"
                                placeholder="Plan hakkında kısa açıklama..."
                                {...register(`licenseOfferings.${index}.description`)}
                            />
                        </div>
                        <div className="col-md-6">
                            <label className="form-label">Geçerlilik başlangıcı</label>
                            <input type="date" className="form-control" {...register(`licenseOfferings.${index}.validFrom`)} />
                        </div>
                        <div className="col-md-6">
                            <label className="form-label">Geçerlilik bitişi</label>
                            <input
                                type="date"
                                className={`form-control ${errors.licenseOfferings?.[index]?.validTo ? "is-invalid" : ""}`}
                                {...register(`licenseOfferings.${index}.validTo`, {
                                    validate: (value) => {
                                        const from = getValues(`licenseOfferings.${index}.validFrom`);
                                        if (from && value && value < from) return "Bitiş tarihi başlangıç tarihinden önce olamaz";
                                        return true;
                                    },
                                })}
                            />
                            {errors.licenseOfferings?.[index]?.validTo && (
                                <div className="invalid-feedback">{errors.licenseOfferings[index]?.validTo?.message}</div>
                            )}
                        </div>
                    </div>
                </Collapse>
            </div>

            <div className="col-12 fs-12px text-soft">
                <span className={`badge badge-dim bg-${meta.color} me-1`}>{meta.label}</span>
                {formatMoney(offering?.basePrice, offering?.currencyCode)}
            </div>
        </div>
    );
};

export default LicenseOfferingFormFields;
