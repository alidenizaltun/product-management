import React, { useEffect, useId, useState } from "react";
import { arrayMove } from "@dnd-kit/sortable";
import { useQueryClient } from "@tanstack/react-query";
import { useFieldArray, useFormContext, useWatch } from "react-hook-form";
import { Collapse, Modal, ModalBody, ModalHeader, UncontrolledTooltip } from "reactstrap";
import { ProductFormValues } from "@/modules/products/types/productEditor.types";
import { productsApi } from "@/modules/products/api/products.api";
import { showApiError, showSuccess, showWarning } from "@/modules/shared/components/NotificationAlert";
import { queryKeys } from "@/services/query/queryKeys";
import { BILLING_UNITS, getBillingPeriodValueForUnit } from "@/modules/products/utils/billingPeriod";
import type { LicenseOfferingForm } from "@/modules/products/types/productEditor.types";

const UNIT_DRAG_MIME = "application/x-product-unit-ref";

interface AssignableProductUnit {
    id?: string;
    _tempId?: string;
    code?: string;
    name?: string;
    isActive?: boolean;
}

const generateTempId = () =>
    `temp_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

const LICENSE_MODELS = [
    { value: 1, label: "Tek Seferlik", icon: "package", color: "primary" },
    { value: 2, label: "Abonelik", icon: "repeat", color: "success" },
    { value: 5, label: "Deneme", icon: "clock", color: "secondary" },
];

const EMPTY_OFFERING = {
    productUnitIds: [] as string[],
    productUnitTempIds: [] as string[],
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
    validFrom: undefined as string | undefined,
    validTo: undefined as string | undefined,
    isActive: true,
    sortOrder: 0,
};

const PLAN_TEMPLATES = [
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

const getModelMeta = (value?: number) =>
    LICENSE_MODELS.find((model) => model.value === Number(value)) ?? LICENSE_MODELS[1];

const normalizeLicenseModel = (value?: number) => {
    const model = Number(value ?? 2);
    return LICENSE_MODELS.some((item) => item.value === model) ? model : 2;
};

const formatMoney = (amount?: number, currency = "TRY") =>
    typeof amount === "number" && Number.isFinite(amount)
        ? `${amount.toLocaleString("tr-TR")} ${currency}`
        : `0 ${currency}`;

interface HelpLabelProps {
    children: React.ReactNode;
    help: string;
}

const HelpLabel: React.FC<HelpLabelProps> = ({ children, help }) => {
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

const toUnitScopeValues = (ids?: Array<string | null | undefined>, tempIds?: Array<string | null | undefined>) => [
    ...(ids ?? []).filter(Boolean).map((id) => `id:${id}`),
    ...(tempIds ?? []).filter(Boolean).map((id) => `temp:${id}`),
];

const splitUnitScopeValues = (values: string[]) => {
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

interface OfferingFieldsProps {
    index: number;
    fieldId: string;
    productId?: string;
    availableProductUnits: AssignableProductUnit[];
    saving: boolean;
    onRemove: () => void;
    onMoveUp: () => void;
    onMoveDown: () => void;
    onSave: () => void;
    isOpen: boolean;
    onToggle: () => void;
    canMoveUp: boolean;
    canMoveDown: boolean;
}

const OfferingFields: React.FC<OfferingFieldsProps> = ({
    index,
    fieldId,
    productId,
    availableProductUnits,
    saving,
    onRemove,
    onMoveUp,
    onMoveDown,
    onSave,
    isOpen,
    onToggle,
    canMoveUp,
    canMoveDown,
}) => {
    const {
        register,
        control,
        getValues,
        setValue,
        formState: { errors },
    } = useFormContext<ProductFormValues>();
    const [advancedOpen, setAdvancedOpen] = useState(false);
    const offering = useWatch({ control, name: `licenseOfferings.${index}` });
    const watchedProductUnits = useWatch({ control, name: "productUnits" }) ?? [];
    const productUnits = availableProductUnits.length ? availableProductUnits : watchedProductUnits;
    const assignableProductUnits = productUnits.filter((unit) => unit.isActive !== false && (unit.id || unit._tempId));
    const model = Number(offering?.licenseModel ?? 2);
    const normalizedModel = normalizeLicenseModel(model);
    const meta = getModelMeta(normalizedModel);

    const showBilling = normalizedModel === 2;
    const showTrial = normalizedModel === 5;
    const saved = Boolean(offering?.id);
    const selectedUnitValues = toUnitScopeValues(
        offering?.productUnitIds?.length ? offering.productUnitIds : offering?.productUnitId ? [offering.productUnitId] : [],
        offering?.productUnitTempIds?.length
            ? offering.productUnitTempIds
            : offering?.productUnitTempId
                ? [offering.productUnitTempId]
                : []
    );
    const hasUnsavedProductUnit = selectedUnitValues.some((value) => value.startsWith("temp:"));

    useEffect(() => {
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
        const values = checked
            ? [...selectedUnitValues, value]
            : selectedUnitValues.filter((item) => item !== value);
        const scope = splitUnitScopeValues([...new Set(values)]);

        setValue(`licenseOfferings.${index}.productUnitIds`, scope.productUnitIds, { shouldDirty: true });
        setValue(`licenseOfferings.${index}.productUnitTempIds`, scope.productUnitTempIds, { shouldDirty: true });
        setValue(`licenseOfferings.${index}.productUnitId`, scope.productUnitId, { shouldDirty: true });
        setValue(`licenseOfferings.${index}.productUnitTempId`, scope.productUnitTempId, { shouldDirty: true });
    };

    const handleUnitDrop = (event: React.DragEvent<HTMLDivElement>) => {
        const value = event.dataTransfer.getData(UNIT_DRAG_MIME);
        if (!value) return;

        event.preventDefault();
        changeProductUnit(value, true);
    };

    return (
        <div className={isOpen ? "pricing-manager-editor" : "pricing-manager-item"}>
                <div className={isOpen ? "pricing-manager-editor-head" : "pricing-manager-item-main"}>
                    <div className="pricing-manager-item-main">
                        <span className={`pricing-manager-item-icon bg-${meta.color}-dim text-${meta.color}`}>
                            <em className={`icon ni ni-${meta.icon}`} />
                        </span>
                        <div className="pricing-manager-item-copy">
                            <div className="d-flex flex-wrap align-items-center gap-2 mb-1">
                                <h6 className="title mb-0">{offering?.name || `Plan #${index + 1}`}</h6>
                                <span className={`badge badge-dim bg-${meta.color}`}>{meta.label}</span>
                                <span className={`badge bg-${offering?.isActive ? "success" : "secondary"}`}>
                                    {offering?.isActive ? "Aktif" : "Pasif"}
                                </span>
                            </div>
                            <div className="pricing-manager-item-meta">
                                <span>{formatMoney(offering?.basePrice, offering?.currencyCode)}</span>
                                <span>Sıra {index + 1}</span>
                            </div>
                        </div>
                    </div>

                    <div className="pricing-manager-actions">
                        <span className="pricing-order-chip" title="Sıra sürükleyerek veya oklarla değiştirilir">
                            Sıra {index + 1}
                        </span>
                        <button
                            type="button"
                            className="btn btn-sm btn-outline-primary"
                            onClick={onToggle}
                        >
                            <em className={`icon ni ni-chevron-${isOpen ? "up" : "down"} me-1`} />
                            {isOpen ? "Kapat" : "Düzenle"}
                        </button>
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

                <input type="hidden" {...register(`licenseOfferings.${index}.sortOrder`, { valueAsNumber: true })} />

                <Collapse isOpen={isOpen}>
                    <div className="row g-3 align-items-end">
                        <div className="col-lg-4">
                            <label className="form-label">
                                <HelpLabel help="Müşterinin satın alacağı paketin görünen adıdır. Aylık Plan, Yıllık Plan veya Kurumsal Paket gibi satışta anlaşılır bir ad kullanın.">
                                    Plan adı
                                </HelpLabel>{" "}
                                <span className="text-danger">*</span>
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
                                <HelpLabel help="Bu satış planının dinamik kurallar çalışmadan önceki başlangıç fiyatıdır. İndirim, artırım veya kademeli hesaplamalar bu fiyat üzerinden uygulanabilir.">
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
                            <label className="form-label">
                                <HelpLabel help="Planın hangi satış mantığıyla sunulacağını belirler. Abonelik dönemsel yenileme, tek seferlik kalıcı lisans, deneme ise geçici erişim senaryosu içindir. Kullanım ve koltuk kararları ürün birimleri ve dinamik kurallar üzerinden yönetilir.">
                                    Satış modeli
                                </HelpLabel>
                            </label>
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
                                    <label className="form-label">
                                        <HelpLabel help="Abonelik planlarında ücretin hangi zaman birimine göre yenileneceğini belirtir. Örneğin ay seçilirse plan aylık, yıl seçilirse yıllık dönemle fiyatlanır.">
                                            Faturalama birimi
                                        </HelpLabel>
                                    </label>
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
                                <div className="col-md-4">
                                    <label className="form-label">
                                        <HelpLabel help="Seçilen faturalama biriminden kaç adet kullanılacağını belirtir. Ay birimi ve 1 periyot aylık, ay birimi ve 3 periyot üç aylık plan anlamına gelir.">
                                            Fatura periyodu
                                        </HelpLabel>
                                    </label>
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

                        {showTrial && (
                            <div className="col-md-5">
                                <label className="form-label">
                                    <HelpLabel help="Deneme planının kaç gün geçerli olacağını belirtir. Süre dolduğunda müşteri ücretli plana geçmek veya erişimi sonlandırmak zorunda kalabilir.">
                                        Deneme süresi
                                    </HelpLabel>
                                </label>
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

                        <div className="col-md-12">
                            <label className="form-label">
                                <HelpLabel help="Bu planın hangi ürün birimleriyle çalışacağını seçer. Örneğin kullanıcı bazlı ücret varsa kullanıcı birimini, cihaz bazlı ücret varsa cihaz birimini plana bağlayın. Üstteki birim paletinden buraya sürükleyerek de ekleyebilirsiniz.">
                                    Paket birimleri
                                </HelpLabel>
                            </label>
                            <div
                                className="pricing-unit-dropzone"
                                onDragOver={(event) => {
                                    if (event.dataTransfer.types.includes(UNIT_DRAG_MIME)) {
                                        event.preventDefault();
                                        event.dataTransfer.dropEffect = "copy";
                                    }
                                }}
                                onDrop={handleUnitDrop}
                            >
                                <div className="pricing-unit-dropzone-hint">
                                    <em className="icon ni ni-drag" />
                                    Birimi buraya bırak
                                </div>
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
                                        <HelpLabel help="Plan sabit paket fiyatıyla satılacaksa ve kullanıcı, cihaz, işlem adedi gibi bir fiyatlandırma birimine bağlı olmayacaksa bu seçeneği kullanın.">
                                            Birimsiz paket
                                        </HelpLabel>
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
                                    <span className="text-soft fs-12px">Önce Ürün Birimleri adımında birim ekleyin.</span>
                                )}
                            </div>
                        </div>

                        {advancedOpen && (
                            <>
                                <div className="col-12">
                                    <label className="form-label">
                                        <HelpLabel help="Planın müşteriye veya operasyon ekibine ne sunduğunu açıklayan opsiyonel metindir. Kapsam, hedef müşteri tipi veya özel notlar burada tutulabilir.">
                                            Plan açıklaması
                                        </HelpLabel>
                                    </label>
                                    <input
                                        className="form-control"
                                        placeholder="Plan hakkında kısa açıklama..."
                                        {...register(`licenseOfferings.${index}.description`)}
                                    />
                                </div>

                                {showBilling && (
                                    <div className="col-md-4">
                                        <label className="form-label">
                                            <HelpLabel help="Abonelik yenileme veya ödeme gecikmesi durumunda erişimin kaç gün daha tolere edileceğini belirtir. Bu süre operasyonel esneklik sağlar.">
                                                Ödeme toleransı
                                            </HelpLabel>
                                        </label>
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
                                )}

                                <div className={`col-md-${showBilling ? "4" : "6"}`}>
                                    <label className="form-label">
                                        <HelpLabel help="Planın satışa veya kullanıma açılacağı başlangıç tarihidir. Boş bırakılırsa plan için başlangıç tarihi kısıtı uygulanmayabilir.">
                                            Geçerlilik başlangıcı
                                        </HelpLabel>
                                    </label>
                                    <input
                                        type="date"
                                        className="form-control"
                                        {...register(`licenseOfferings.${index}.validFrom`)}
                                    />
                                </div>
                                <div className={`col-md-${showBilling ? "4" : "6"}`}>
                                    <label className="form-label">
                                        <HelpLabel help="Planın satış veya kullanım için geçerli olacağı son tarihtir. Kampanya veya dönemsel planlarda bu alanla bitiş sınırı verilir.">
                                            Geçerlilik bitişi
                                        </HelpLabel>
                                    </label>
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
                            <div className="form-check form-switch">
                                <input
                                    type="checkbox"
                                    className="form-check-input"
                                    id={`offering-active-${fieldId}`}
                                    {...register(`licenseOfferings.${index}.isActive`)}
                                />
                                <label className="form-check-label" htmlFor={`offering-active-${fieldId}`}>
                                    <HelpLabel help="Pasif planlar ürün üzerinde saklanır ancak satışa hazır aktif paket gibi değerlendirilmez. Taslak veya geçici olarak kapatılmış planlar için kullanılabilir.">
                                        Plan aktif
                                    </HelpLabel>
                                </label>
                            </div>
                        </div>

                        <div className="col-12 d-flex flex-wrap justify-content-end align-items-center gap-2 border-top pt-3 h-100">
                            <button
                                type="button"
                                className="btn btn-light"
                                onClick={onToggle}
                                disabled={saving}
                            >
                                Kapat
                            </button>
                            <button
                                type="button"
                                className="btn btn-primary"
                                disabled={saving || Boolean(productId && hasUnsavedProductUnit)}
                                onClick={onSave}
                                title={
                                    productId && hasUnsavedProductUnit
                                            ? "Yeni ürün birimiyle birlikte kaydetmek için ana formu kaydedin"
                                            : undefined
                                }
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
                </Collapse>
        </div>
    );
};

interface LicenseOfferingsTabProps {
    productId?: string;
    productUnits?: AssignableProductUnit[];
}

const toOptionalNumber = (value?: number) =>
    typeof value === "number" && Number.isFinite(value) ? value : undefined;

const toOptionalString = (value?: string | null) => {
    const trimmed = value?.trim();
    return trimmed || undefined;
};

const buildOfferingPayload = (offering: LicenseOfferingForm) => {
    const productUnitIds = (offering.productUnitIds?.length ? offering.productUnitIds : offering.productUnitId ? [offering.productUnitId] : [])
        .filter(Boolean);

    return {
        productUnitId: productUnitIds[0] || undefined,
        productUnitIds: productUnitIds.length ? productUnitIds : undefined,
        licenseModel: normalizeLicenseModel(offering.licenseModel),
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
        validFrom: toOptionalString(offering.validFrom),
        validTo: toOptionalString(offering.validTo),
        isActive: Boolean(offering.isActive),
        sortOrder: toOptionalNumber(offering.sortOrder) ?? 0,
    };
};

const LicenseOfferingsTab: React.FC<LicenseOfferingsTabProps> = ({ productId, productUnits = [] }) => {
    const queryClient = useQueryClient();
    const { control, getValues, setValue, trigger } = useFormContext<ProductFormValues>();
    const { fields, append, remove, move } = useFieldArray({ control, name: "licenseOfferings" });
    const licenseOfferings = useWatch({ control, name: "licenseOfferings" }) ?? [];
    const [savingIndex, setSavingIndex] = useState<number | null>(null);
    const [editingOfferingIndex, setEditingOfferingIndex] = useState<number | null>(null);
    const [templateModalOpen, setTemplateModalOpen] = useState(false);

    const addTemplate = (template: typeof PLAN_TEMPLATES[number]) => {
        const tempId = generateTempId();
        const nextIndex = fields.length;
        append({
            ...EMPTY_OFFERING,
            ...template.offering,
            _tempId: tempId,
            sortOrder: fields.length + 1,
        });
        setTemplateModalOpen(false);
        setEditingOfferingIndex(nextIndex);
    };

    const addEmptyOffering = () => {
        const tempId = generateTempId();
        const nextIndex = fields.length;
        append({ ...EMPTY_OFFERING, _tempId: tempId, sortOrder: fields.length + 1 });
        setTemplateModalOpen(false);
        setEditingOfferingIndex(nextIndex);
    };

    const getOfferingCardKey = (offering: LicenseOfferingForm | undefined, fallbackId: string) =>
        offering?.id ? `id:${offering.id}` : offering?._tempId ? `temp:${offering._tempId}` : fallbackId;

    const closeOfferingCard = (_key?: string) => setEditingOfferingIndex(null);

    const reorderOfferings = (oldIndex: number, newIndex: number) => {
        if (oldIndex === newIndex || oldIndex < 0 || newIndex < 0) return;

        move(oldIndex, newIndex);
        arrayMove(licenseOfferings, oldIndex, newIndex).forEach((_, offeringIndex) => {
            setValue(`licenseOfferings.${offeringIndex}.sortOrder`, offeringIndex + 1, { shouldDirty: true });
        });
    };

    const saveOffering = async (index: number) => {
        const valid = await trigger([
            `licenseOfferings.${index}.name`,
            `licenseOfferings.${index}.basePrice`,
            `licenseOfferings.${index}.validTo`,
        ]);
        if (!valid) return;

        const offering = getValues(`licenseOfferings.${index}`);
        if (!productId) {
            showSuccess("Satış planı taslağa eklendi. Ürün kaydedildiğinde backend'e gönderilecek.");
            closeOfferingCard();
            return;
        }

        if (offering.productUnitTempIds?.length || offering.productUnitTempId) {
            showWarning("Önce ürün birimini kaydedin, sonra planı kaydedebilirsiniz.");
            return;
        }
        const payload = buildOfferingPayload(offering);
        const cardKey = getOfferingCardKey(offering, fields[index]?.id ?? String(index));

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
            closeOfferingCard(cardKey);
        } catch (error) {
            showApiError(error);
        } finally {
            setSavingIndex(null);
        }
    };

    return (
        <div>
            <div className="pricing-manager-head">
                <div>
                    <h6 className="overline-title text-primary mb-0">Satış Planları</h6>
                    <p className="text-soft fs-12 mb-0">
                        Paketi oluşturun, sonra bu pakette kullanılacak fiyatlandırma birimlerini seçin.
                    </p>
                </div>
                <button
                    type="button"
                    className="btn btn-sm btn-outline-primary"
                    onClick={() => setTemplateModalOpen(true)}
                >
                    <em className="icon ni ni-plus me-1" />
                    Plan ekle
                </button>
            </div>

            {fields.length === 0 ? (
                <div className="text-center py-5 text-soft">
                    <em className="icon ni ni-tag fs-2 d-block mb-2" />
                    <p className="mb-0">
                        Henüz plan eklenmedi. Plan ekle ile bir şablon seçin.
                    </p>
                </div>
            ) : (
                <div className="table-responsive">
                    <table className="table table-middle mb-0">
                        <thead className="table-light">
                            <tr>
                                <th>Paket adı</th>
                                <th>Model</th>
                                <th>Taban fiyat</th>
                                <th>Sıra</th>
                                <th>Durum</th>
                                <th className="text-end">İşlem</th>
                            </tr>
                        </thead>
                        <tbody>
                            {fields.map((field, index) => {
                                const offering = licenseOfferings[index];
                                const meta = getModelMeta(Number(offering?.licenseModel ?? 2));
                                return (
                                    <tr key={field.id}>
                                        <td>
                                            <div className="fw-medium">{offering?.name || `Plan #${index + 1}`}</div>
                                            <div className="text-soft fs-12px">{offering?.description || "Açıklama yok"}</div>
                                        </td>
                                        <td>
                                            <span className={`badge badge-dim bg-${meta.color}`}>{meta.label}</span>
                                        </td>
                                        <td>{formatMoney(offering?.basePrice, offering?.currencyCode)}</td>
                                        <td>{index + 1}</td>
                                        <td>
                                            <span className={`badge bg-${offering?.isActive ? "success" : "secondary"}`}>
                                                {offering?.isActive ? "Aktif" : "Pasif"}
                                            </span>
                                        </td>
                                        <td className="text-end">
                                            <div className="d-inline-flex flex-wrap justify-content-end gap-1">
                                                <button
                                                    type="button"
                                                    className="btn btn-sm btn-outline-primary"
                                                    onClick={() => setEditingOfferingIndex(index)}
                                                >
                                                    <em className="icon ni ni-edit me-1" />
                                                    Düzenle
                                                </button>
                                                <button
                                                    type="button"
                                                    className="btn btn-sm btn-icon btn-outline-light"
                                                    disabled={index === 0}
                                                    onClick={() => reorderOfferings(index, index - 1)}
                                                    title="Yukarı taşı"
                                                >
                                                    <em className="icon ni ni-chevron-up" />
                                                </button>
                                                <button
                                                    type="button"
                                                    className="btn btn-sm btn-icon btn-outline-light"
                                                    disabled={index === fields.length - 1}
                                                    onClick={() => reorderOfferings(index, index + 1)}
                                                    title="Aşağı taşı"
                                                >
                                                    <em className="icon ni ni-chevron-down" />
                                                </button>
                                                <button
                                                    type="button"
                                                    className="btn btn-sm btn-icon btn-outline-danger"
                                                    onClick={() => remove(index)}
                                                    title="Paketi kaldır"
                                                >
                                                    <em className="icon ni ni-trash" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}

            <Modal isOpen={templateModalOpen} toggle={() => setTemplateModalOpen(false)} size="lg" centered>
                <ModalHeader toggle={() => setTemplateModalOpen(false)}>
                    Satış Planı Seç
                </ModalHeader>
                <ModalBody className="pricing-manager-modal-body">
                    <div className="pricing-manager-modal-intro">
                        <span className="overline-title text-primary">Hızlı başlangıç</span>
                        <p className="text-soft fs-13px mb-0">
                            Bir plan şablonu seçin veya boş planla kendi paket yapınızı oluşturun.
                        </p>
                    </div>
                    <div className="row g-3">
                        {PLAN_TEMPLATES.map((template) => (
                            <div className="col-sm-6" key={template.title}>
                                <button
                                    type="button"
                                    className="card card-bordered h-100 w-100 bg-white text-start pricing-template-card"
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
                        <div className="col-sm-6">
                            <button
                                type="button"
                                className="card card-bordered h-100 w-100 bg-white text-start pricing-template-card"
                                onClick={addEmptyOffering}
                            >
                                <div className="card-inner">
                                    <span className="btn btn-icon btn-light rounded-circle mb-3">
                                        <em className="icon ni ni-plus" />
                                    </span>
                                    <h6 className="title mb-1">Boş plan</h6>
                                    <p className="text-soft fs-12px mb-0">Tüm alanları kendiniz doldurun.</p>
                                </div>
                            </button>
                        </div>
                    </div>
                </ModalBody>
            </Modal>

            {editingOfferingIndex != null && fields[editingOfferingIndex] && (
                <Modal isOpen toggle={() => setEditingOfferingIndex(null)} size="xl" centered>
                    <ModalHeader toggle={() => setEditingOfferingIndex(null)}>
                        {licenseOfferings[editingOfferingIndex]?.id ? "Satış Planını Güncelle" : "Satış Planı Ekle"}
                    </ModalHeader>
                    <ModalBody className="pricing-manager-modal-body">
                        <div className="pricing-manager-modal-intro">
                            <span className="overline-title text-primary">Paket bilgileri</span>
                            <p className="text-soft fs-13px mb-0">
                                Satışa çıkacak paketin fiyatını, modelini ve bağlı birimlerini düzenleyin.
                            </p>
                        </div>
                        <OfferingFields
                            index={editingOfferingIndex}
                            fieldId={fields[editingOfferingIndex].id}
                            productId={productId}
                            availableProductUnits={productUnits}
                            saving={savingIndex === editingOfferingIndex}
                            onRemove={() => {
                                remove(editingOfferingIndex);
                                setEditingOfferingIndex(null);
                            }}
                            onMoveUp={() => reorderOfferings(editingOfferingIndex, editingOfferingIndex - 1)}
                            onMoveDown={() => reorderOfferings(editingOfferingIndex, editingOfferingIndex + 1)}
                            onSave={() => void saveOffering(editingOfferingIndex)}
                            isOpen
                            onToggle={() => setEditingOfferingIndex(null)}
                            canMoveUp={editingOfferingIndex > 0}
                            canMoveDown={editingOfferingIndex < fields.length - 1}
                        />
                    </ModalBody>
                </Modal>
            )}
        </div>
    );
};

export default LicenseOfferingsTab;
