import React from "react";
import { DndContext, KeyboardSensor, PointerSensor, closestCenter, useSensor, useSensors } from "@dnd-kit/core";
import type { DragEndEvent } from "@dnd-kit/core";
import {
    SortableContext,
    arrayMove,
    sortableKeyboardCoordinates,
    useSortable,
    verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useFieldArray, useFormContext, useWatch } from "react-hook-form";
import { ProductFormValues } from "@/modules/products/types/productEditor.types";

const CURRENCY_OPTIONS = ["TRY", "USD", "EUR", "GBP"];
const ALL_LICENSE_OFFERINGS_KEY = "__all_license_offerings__";

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
    appliesToAllLicenseOfferings: false,
    price: 0,
    currencyCode: "TRY",
    isActive: true,
};

type SortableHandleProps = {
    attributes: ReturnType<typeof useSortable>["attributes"];
    listeners: ReturnType<typeof useSortable>["listeners"];
};

const SortableModuleCard: React.FC<{
    id: string;
    children: (dragHandleProps: SortableHandleProps) => React.ReactNode;
}> = ({ id, children }) => {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });

    return (
        <div
            ref={setNodeRef}
            className={`pricing-sortable-item ${isDragging ? "is-dragging" : ""}`}
            style={{
                transform: CSS.Transform.toString(transform),
                transition,
            }}
        >
            {children({ attributes, listeners })}
        </div>
    );
};

const ModuleOfferingPricesSection: React.FC<{ moduleIndex: number }> = ({ moduleIndex }) => {
    const { register, control, setValue } = useFormContext<ProductFormValues>();
    const { fields, append, remove } = useFieldArray({
        control,
        name: `modules.${moduleIndex}.offeringPrices`,
    });

    const licenseOfferings = useWatch({ control, name: "licenseOfferings" }) ?? [];
    const watchedPrices = useWatch({ control, name: `modules.${moduleIndex}.offeringPrices` }) ?? [];
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
                                <input
                                    type="hidden"
                                    {...register(`modules.${moduleIndex}.offeringPrices.${priceIndex}.productLicenseOfferingId`)}
                                />
                                <input
                                    type="hidden"
                                    {...register(`modules.${moduleIndex}.offeringPrices.${priceIndex}.licenseOfferingTempId`)}
                                />
                                <div className="row g-2 align-items-end">
                                    <div className="col-md-4">
                                        <label className="form-label fs-12 mb-1">
                                            Lisans Paketi <span className="text-danger">*</span>
                                        </label>
                                        <select
                                            className="form-control form-select form-select-sm"
                                            value={
                                                watchedPrices[priceIndex]?.appliesToAllLicenseOfferings
                                                    ? ALL_LICENSE_OFFERINGS_KEY
                                                    : watchedPrices[priceIndex]?.productLicenseOfferingId ||
                                                    watchedPrices[priceIndex]?.licenseOfferingTempId ||
                                                    ""
                                            }
                                            onChange={(e) => {
                                                const selectedKey = e.target.value;
                                                if (selectedKey === ALL_LICENSE_OFFERINGS_KEY) {
                                                    setValue(`modules.${moduleIndex}.offeringPrices.${priceIndex}.appliesToAllLicenseOfferings`, true, { shouldDirty: true });
                                                    setValue(`modules.${moduleIndex}.offeringPrices.${priceIndex}.productLicenseOfferingId`, undefined, { shouldDirty: true });
                                                    setValue(`modules.${moduleIndex}.offeringPrices.${priceIndex}.licenseOfferingTempId`, undefined, { shouldDirty: true });
                                                    return;
                                                }

                                                const offering = allOfferings.find(
                                                    (lo) => lo.id === selectedKey || lo._tempId === selectedKey
                                                );
                                                setValue(`modules.${moduleIndex}.offeringPrices.${priceIndex}.appliesToAllLicenseOfferings`, false, { shouldDirty: true });
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
                                            <option value="">-- Seçiniz --</option>
                                            {allOfferings.length > 1 && (
                                                <option value={ALL_LICENSE_OFFERINGS_KEY}>Tüm planlar</option>
                                            )}
                                            {allOfferings.map((lo) => (
                                                <option key={lo.id ?? lo._tempId} value={lo.id ?? lo._tempId ?? ""}>
                                                    {lo.name || "(İsimsiz Teklif)"}
                                                    {!lo.id && " yeni"}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="col-md-4">
                                        <label className="form-label fs-12 mb-1">Fiyat</label>
                                        <div className="input-group input-group-sm">
                                            <input
                                                type="number"
                                                step="0.01"
                                                min="0"
                                                className="form-control"
                                                placeholder="0.00"
                                                {...register(`modules.${moduleIndex}.offeringPrices.${priceIndex}.price`, { valueAsNumber: true })}
                                            />
                                            <select
                                                className="form-select"
                                                style={{ maxWidth: 96 }}
                                                {...register(`modules.${moduleIndex}.offeringPrices.${priceIndex}.currencyCode`)}
                                            >
                                                {CURRENCY_OPTIONS.map((currency) => (
                                                    <option key={currency} value={currency}>
                                                        {currency}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
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
                                    <div className="col-md-2 d-flex align-items-end justify-content-end">
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
        setValue,
        formState: { errors },
    } = useFormContext<ProductFormValues>();
    const { fields, append, remove, move } = useFieldArray({ control, name: "modules" });
    const modules = useWatch({ control, name: "modules" }) ?? [];
    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    const reorderModules = (oldIndex: number, newIndex: number) => {
        if (oldIndex === newIndex || oldIndex < 0 || newIndex < 0) return;

        move(oldIndex, newIndex);
        arrayMove(modules, oldIndex, newIndex).forEach((_, moduleIndex) => {
            setValue(`modules.${moduleIndex}.sortOrder`, moduleIndex + 1, { shouldDirty: true });
        });
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (!over || active.id === over.id) return;

        const oldIndex = fields.findIndex((field) => field.id === active.id);
        const newIndex = fields.findIndex((field) => field.id === over.id);
        reorderModules(oldIndex, newIndex);
    };

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
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                    <SortableContext items={fields.map((field) => field.id)} strategy={verticalListSortingStrategy}>
                        <div className="d-flex flex-column gap-3 h-100">
                            {fields.map((field, index) => (
                                <SortableModuleCard id={field.id} key={field.id}>
                                    {({ attributes, listeners }) => (
                                        <div className="card card-bordered">
                                            <div className="card-inner">
                                                <div className="d-flex align-items-center justify-content-between mb-3">
                                                    <span className="badge bg-primary-soft text-primary">Modül #{index + 1}</span>
                                                    <div className="d-flex flex-wrap justify-content-end align-items-center gap-1">
                                                        <span className="pricing-order-chip" title="Sıra sürükleyerek değiştirilir">
                                                            Sıra {index + 1}
                                                        </span>
                                                        <button
                                                            type="button"
                                                            className="btn btn-sm btn-icon btn-outline-light pricing-drag-handle"
                                                            title="Sürükleyerek sırala"
                                                            {...attributes}
                                                            {...listeners}
                                                        >
                                                            <em className="icon ni ni-drag" />
                                                        </button>
                                                        <button
                                                            type="button"
                                                            className="btn btn-sm btn-icon btn-outline-light"
                                                            disabled={index === 0}
                                                            onClick={() => reorderModules(index, index - 1)}
                                                            title="Yukarı taşı"
                                                        >
                                                            <em className="icon ni ni-chevron-up" />
                                                        </button>
                                                        <button
                                                            type="button"
                                                            className="btn btn-sm btn-icon btn-outline-light"
                                                            disabled={index === fields.length - 1}
                                                            onClick={() => reorderModules(index, index + 1)}
                                                            title="Aşağı taşı"
                                                        >
                                                            <em className="icon ni ni-chevron-down" />
                                                        </button>
                                                        <button
                                                            type="button"
                                                            className="btn btn-sm btn-icon btn-outline-danger"
                                                            onClick={() => remove(index)}
                                                            title="Modülü Kaldır"
                                                        >
                                                            <em className="icon ni ni-trash" />
                                                        </button>
                                                    </div>
                                                </div>
                                                <input type="hidden" {...register(`modules.${index}.sortOrder`, { valueAsNumber: true })} />

                                                <div className="row g-3">
                                                    <div className="col-md-3">
                                                        <label className="form-label">
                                                            Modül Kodu
                                                        </label>
                                                        <input
                                                            className="form-control"
                                                            placeholder="Boşsa otomatik üretilir"
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
                                                        <label className="form-label">Varsayılan para birimi</label>
                                                        <select
                                                            className="form-control form-select"
                                                            {...register(`modules.${index}.currencyCode`)}
                                                        >
                                                            {CURRENCY_OPTIONS.map((currency) => (
                                                                <option key={currency} value={currency}>
                                                                    {currency}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                    <div className="col-12">
                                                        <label className="form-label">Açıklama</label>
                                                        <input
                                                            className="form-control"
                                                            placeholder="Modül hakkında kısa açıklama..."
                                                            {...register(`modules.${index}.description`)}
                                                        />
                                                    </div>
                                                    <div className="col-12 d-flex align-items-end pb-1 gap-4">
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

                                                <ModuleOfferingPricesSection moduleIndex={index} />
                                            </div>
                                        </div>
                                    )}
                                </SortableModuleCard>
                            ))}
                        </div>
                    </SortableContext>
                </DndContext>
            )}
        </div>
    );
};

export default ProductModulesTab;
