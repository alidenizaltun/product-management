import React, { useEffect, useId, useState } from "react";
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
import { useQueryClient } from "@tanstack/react-query";
import { useFieldArray, useFormContext, useWatch } from "react-hook-form";
import { Button, Collapse, Modal, ModalBody, ModalFooter, ModalHeader, UncontrolledTooltip } from "reactstrap";
import { unitDefinitionsApi } from "@/services/unitDefinitions/unitDefinitions.api";
import { productsApi } from "@/modules/products/api/products.api";
import { showApiError, showSuccess, showWarning } from "@/modules/shared/components/NotificationAlert";
import { queryKeys } from "@/services/query/queryKeys";
import type { ProductFormValues, ProductUnitForm } from "@/modules/products/types/productEditor.types";
import type { CreateProductUnitRequestDto, UnitDefinitionDto, UnitRole } from "@/shared/types/productOperations.types";

const generateTempId = () => `product-unit-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
const DEFAULT_PRODUCT_UNIT_ROLE: UnitRole = 1;

const EMPTY_UNIT: ProductUnitForm = {
    _tempId: "",
    unitDefinitionId: "",
    code: "",
    name: "",
    description: "",
    role: DEFAULT_PRODUCT_UNIT_ROLE,
    isDefault: false,
    isActive: true,
    sortOrder: 0,
};

interface QuickUnitDefinitionForm {
    code: string;
    name: string;
    description: string;
}

const EMPTY_QUICK_DEFINITION: QuickUnitDefinitionForm = {
    code: "",
    name: "",
    description: "",
};

interface ProductUnitsTabProps {
    productId?: string;
}

interface HelpLabelProps {
    children: React.ReactNode;
    help: string;
}

const HelpLabel: React.FC<HelpLabelProps> = ({ children, help }) => {
    const reactId = useId();
    const id = `unit-help-${reactId.replace(/[^a-zA-Z0-9_-]/g, "")}`;

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

const SortableUnitCard: React.FC<{
    id: string;
    children: (dragHandleProps: {
        attributes: ReturnType<typeof useSortable>["attributes"];
        listeners: ReturnType<typeof useSortable>["listeners"];
    }) => React.ReactNode;
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

const ProductUnitsTab: React.FC<ProductUnitsTabProps> = ({ productId }) => {
    const queryClient = useQueryClient();
    const { control, register, setValue, getValues } = useFormContext<ProductFormValues>();
    const { fields, append, remove, move } = useFieldArray({ control, name: "productUnits" });
    const productUnits = useWatch({ control, name: "productUnits" }) ?? [];
    const [unitDefinitions, setUnitDefinitions] = useState<UnitDefinitionDto[]>([]);
    const [savingIndex, setSavingIndex] = useState<number | null>(null);
    const [quickAddIndex, setQuickAddIndex] = useState<number | null>(null);
    const [quickDefinition, setQuickDefinition] = useState<QuickUnitDefinitionForm>(EMPTY_QUICK_DEFINITION);
    const [creatingDefinition, setCreatingDefinition] = useState(false);
    const [openUnitCards, setOpenUnitCards] = useState<Set<string>>(new Set());
    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    useEffect(() => {
        unitDefinitionsApi.getAll().then(setUnitDefinitions).catch(() => setUnitDefinitions([]));
    }, []);

    const addUnit = () => {
        const tempId = generateTempId();
        append({
            ...EMPTY_UNIT,
            _tempId: tempId,
            isDefault: fields.length === 0,
            sortOrder: fields.length,
        });
        setOpenUnitCards((current) => new Set(current).add(`temp:${tempId}`));
    };

    const getUnitCardKey = (unit: ProductUnitForm | undefined, fallbackId: string) =>
        unit?.id ? `id:${unit.id}` : unit?._tempId ? `temp:${unit._tempId}` : fallbackId;

    const toggleUnitCard = (key: string) => {
        setOpenUnitCards((current) => {
            const next = new Set(current);
            if (next.has(key)) {
                next.delete(key);
            } else {
                next.add(key);
            }
            return next;
        });
    };

    const closeUnitCard = (key: string) => {
        setOpenUnitCards((current) => {
            const next = new Set(current);
            next.delete(key);
            return next;
        });
    };

    const openQuickAdd = (index: number) => {
        const unit = getValues(`productUnits.${index}`);
        setQuickAddIndex(index);
        setQuickDefinition({
            code: unit?.code?.trim() || "",
            name: unit?.name?.trim() || "",
            description: unit?.description?.trim() || "",
        });
    };

    const closeQuickAdd = () => {
        if (creatingDefinition) return;
        setQuickAddIndex(null);
        setQuickDefinition(EMPTY_QUICK_DEFINITION);
    };

    const applyDefinition = (index: number, unitDefinitionId: string) => {
        const definition = unitDefinitions.find((unit) => unit.id === unitDefinitionId);
        setValue(`productUnits.${index}.unitDefinitionId`, unitDefinitionId, { shouldDirty: true });
        if (!definition) return;

        setValue(`productUnits.${index}.code`, definition.code, { shouldDirty: true });
        setValue(`productUnits.${index}.name`, definition.name, { shouldDirty: true });
    };

    const createUnitDefinition = async () => {
        if (quickAddIndex == null) return;

        const code = quickDefinition.code.trim().toUpperCase();
        const name = quickDefinition.name.trim();
        const description = quickDefinition.description.trim();

        if (!code || !name) {
            showWarning("Birim kodu ve adı zorunlu.");
            return;
        }

        try {
            setCreatingDefinition(true);
            const created = await unitDefinitionsApi.create({
                code,
                name,
                description: description || undefined,
                isActive: true,
                sortOrder: unitDefinitions.length,
            });
            setUnitDefinitions((current) => [...current, created].sort((a, b) => a.sortOrder - b.sortOrder));
            applyDefinition(quickAddIndex, created.id);
            await queryClient.invalidateQueries({ queryKey: queryKeys.catalog.unitDefinitions });
            showSuccess("Birim sözlüğü eklendi.");
            setQuickAddIndex(null);
            setQuickDefinition(EMPTY_QUICK_DEFINITION);
        } catch (error) {
            showApiError(error);
        } finally {
            setCreatingDefinition(false);
        }
    };

    const setDefault = (index: number, checked: boolean) => {
        productUnits.forEach((_, unitIndex) => {
            setValue(`productUnits.${unitIndex}.isDefault`, checked && unitIndex === index, { shouldDirty: true });
        });
    };

    const reorderUnits = (oldIndex: number, newIndex: number) => {
        if (oldIndex === newIndex || oldIndex < 0 || newIndex < 0) return;

        move(oldIndex, newIndex);
        arrayMove(productUnits, oldIndex, newIndex).forEach((_, unitIndex) => {
            setValue(`productUnits.${unitIndex}.sortOrder`, unitIndex, { shouldDirty: true });
        });
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (!over || active.id === over.id) return;

        const oldIndex = fields.findIndex((field) => field.id === active.id);
        const newIndex = fields.findIndex((field) => field.id === over.id);
        reorderUnits(oldIndex, newIndex);
    };

    const buildPayload = (unit: ProductUnitForm): CreateProductUnitRequestDto | null => {
        const unitDefinitionId = unit.unitDefinitionId?.trim();
        const code = unit.code?.trim();
        const name = unit.name?.trim();

        if (!unitDefinitionId || !code || !name) {
            showWarning("Birim sözlüğü, ürün içi kod ve ürün içi ad zorunlu.");
            return null;
        }

        return {
            id: unit.id || undefined,
            _tempId: unit._tempId || undefined,
            unitDefinitionId,
            code,
            name,
            description: unit.description?.trim() || undefined,
            role: DEFAULT_PRODUCT_UNIT_ROLE,
            isDefault: Boolean(unit.isDefault),
            isActive: Boolean(unit.isActive),
            sortOrder: Number.isFinite(unit.sortOrder) ? unit.sortOrder : 0,
        };
    };

    const invalidateProductUnits = async () => {
        if (!productId) return;
        await queryClient.invalidateQueries({ queryKey: queryKeys.products.detail(productId) });
        await queryClient.invalidateQueries({ queryKey: queryKeys.products.units(productId) });
        await queryClient.invalidateQueries({ queryKey: queryKeys.products.all });
    };

    const replaceTempReferences = (tempId: string | undefined, createdId: string) => {
        if (!tempId) return;

        const licenseOfferings = getValues("licenseOfferings") ?? [];
        licenseOfferings.forEach((offering, index) => {
            const tempIds = offering.productUnitTempIds ?? [];
            const hasTempReference = offering.productUnitTempId === tempId || tempIds.includes(tempId);
            if (!hasTempReference) return;

            const productUnitIds = [...(offering.productUnitIds ?? []), createdId].filter(Boolean);
            const productUnitTempIds = tempIds.filter((id) => id !== tempId);
            setValue(`licenseOfferings.${index}.productUnitIds`, [...new Set(productUnitIds)], { shouldDirty: true });
            setValue(`licenseOfferings.${index}.productUnitTempIds`, productUnitTempIds, { shouldDirty: true });
            setValue(`licenseOfferings.${index}.productUnitId`, productUnitIds[0], { shouldDirty: true });
            setValue(
                `licenseOfferings.${index}.productUnitTempId`,
                productUnitIds.length === 0 ? productUnitTempIds[0] : undefined,
                { shouldDirty: true }
            );
        });

        const pricingRules = getValues("pricingRules") ?? [];
        pricingRules.forEach((rule, index) => {
            const tempIds = rule.productUnitTempIds ?? [];
            const hasTempReference = rule.productUnitTempId === tempId || tempIds.includes(tempId);
            if (!hasTempReference) return;

            const productUnitIds = [...(rule.productUnitIds ?? []), createdId].filter(Boolean);
            const productUnitTempIds = tempIds.filter((id) => id !== tempId);
            setValue(`pricingRules.${index}.productUnitIds`, [...new Set(productUnitIds)], { shouldDirty: true });
            setValue(`pricingRules.${index}.productUnitTempIds`, productUnitTempIds, { shouldDirty: true });
            setValue(`pricingRules.${index}.productUnitId`, productUnitIds[0], { shouldDirty: true });
            setValue(
                `pricingRules.${index}.productUnitTempId`,
                productUnitIds.length === 0 ? productUnitTempIds[0] : undefined,
                { shouldDirty: true }
            );
        });
    };

    const saveUnit = async (index: number) => {
        const unit = getValues(`productUnits.${index}`);
        const payload = buildPayload(unit);
        if (!payload) return;
        const cardKey = getUnitCardKey(unit, fields[index]?.id ?? String(index));

        if (!productId) {
            showSuccess("Birim taslağa eklendi. Ürün kaydedildiğinde backend'e gönderilecek.");
            closeUnitCard(cardKey);
            return;
        }

        try {
            setSavingIndex(index);
            if (unit.id) {
                const { id: _id, _tempId, ...updatePayload } = payload;
                await productsApi.updateProductUnit(unit.id, updatePayload);
                showSuccess("Ürün birimi güncellendi.");
            } else {
                const created = await productsApi.createProductUnit(productId, payload);
                setValue(`productUnits.${index}.id`, created.id, { shouldDirty: false });
                setValue(`productUnits.${index}._tempId`, undefined, { shouldDirty: false });
                replaceTempReferences(unit._tempId, created.id);
                showSuccess("Ürün birimi eklendi.");
            }

            await invalidateProductUnits();
            closeUnitCard(cardKey);
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
                    <h6 className="overline-title text-primary mb-0">Ürün Birimleri</h6>
                    <p className="text-soft fs-12 mb-0">
                        Bu üründe fiyatlandırılabilir veya tekliflere bağlanabilir birimleri tanımlayın.
                    </p>
                </div>
                <button type="button" className="btn btn-sm btn-outline-primary" onClick={addUnit}>
                    <em className="icon ni ni-plus me-1" />
                    Yeni birim
                </button>
            </div>

            {fields.length === 0 ? (
                <div className="text-center py-5 text-soft">
                    <em className="icon ni ni-grid-add-c fs-2 d-block mb-2" />
                    <p className="mb-0">Henüz ürün birimi eklenmedi.</p>
                </div>
            ) : (
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                    <SortableContext items={fields.map((field) => field.id)} strategy={verticalListSortingStrategy}>
                        <div className="d-flex flex-column gap-3 h-100">
                            {fields.map((field, index) => {
                                const unit = productUnits[index];
                                const saved = Boolean(unit?.id);
                                const saving = savingIndex === index;
                                const cardKey = getUnitCardKey(unit, field.id);
                                const isCardOpen = openUnitCards.has(cardKey);
                                return (
                                    <SortableUnitCard id={field.id} key={field.id}>
                                        {({ attributes, listeners }) => (
                                            <div className="card card-bordered">
                                <div className="card-inner">
                                    <div className="d-flex justify-content-between align-items-start gap-3 mb-3 h-100">
                                        <div>
                                            <h6 className="title mb-0">{unit?.name || `Birim #${index + 1}`}</h6>
                                            <p className="text-soft fs-12px mb-0">
                                                {unit?.code || "Kod bekleniyor"}
                                                {unit?.isDefault ? " · Varsayılan" : ""}
                                            </p>
                                        </div>
                                        <div className="d-flex gap-1 h-100">
                                            <button
                                                type="button"
                                                className="btn btn-sm btn-outline-primary"
                                                onClick={() => toggleUnitCard(cardKey)}
                                            >
                                                <em className={`icon ni ni-chevron-${isCardOpen ? "up" : "down"} me-1`} />
                                                {isCardOpen ? "Kapat" : "Düzenle"}
                                            </button>
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
                                                onClick={() => reorderUnits(index, index - 1)}
                                                title="Yukarı taşı"
                                            >
                                                <em className="icon ni ni-chevron-up" />
                                            </button>
                                            <button
                                                type="button"
                                                className="btn btn-sm btn-icon btn-outline-light"
                                                disabled={index === fields.length - 1}
                                                onClick={() => reorderUnits(index, index + 1)}
                                                title="Aşağı taşı"
                                            >
                                                <em className="icon ni ni-chevron-down" />
                                            </button>
                                            <button
                                                type="button"
                                                className="btn btn-sm btn-icon btn-outline-danger"
                                                onClick={() => remove(index)}
                                                title="Birimi kaldır"
                                            >
                                                <em className="icon ni ni-trash" />
                                            </button>
                                        </div>
                                    </div>

                                    <Collapse isOpen={isCardOpen}>
                                    <div className="row g-3 align-items-end">
                                        <div className="col-md-4">
                                            <label className="form-label">
                                                <HelpLabel help="Üründe kullanacağınız temel ölçü veya kullanım birimini sözlükten seçer. Seçilen sözlük değeri ürün içi kod ve ad alanlarını otomatik doldurur.">
                                                    Birim sözlüğü
                                                </HelpLabel>
                                            </label>
                                            <div className="input-group">
                                                <select
                                                    className="form-select"
                                                    value={unit?.unitDefinitionId ?? ""}
                                                    onChange={(event) => applyDefinition(index, event.target.value)}
                                                >
                                                    <option value="">Birim seçiniz</option>
                                                    {unitDefinitions.map((definition) => (
                                                        <option key={definition.id} value={definition.id}>
                                                            {definition.name} ({definition.code})
                                                        </option>
                                                    ))}
                                                </select>
                                                <button
                                                    type="button"
                                                    className="btn btn-outline-primary btn-icon"
                                                    onClick={() => openQuickAdd(index)}
                                                    title="Birim sözlüğü ekle"
                                                >
                                                    <em className="icon ni ni-plus" />
                                                </button>
                                            </div>
                                        </div>
                                        <div className="col-md-4">
                                            <label className="form-label">
                                                <HelpLabel help="Bu ürün içinde birimi kısa ve teknik olarak tanımlayan koddur. Örneğin USER, DEVICE veya API_CALL gibi kural ve planlarda kolay tanınacak bir değer kullanın.">
                                                    Ürün birim kodu
                                                </HelpLabel>
                                            </label>
                                            <input className="form-control" {...register(`productUnits.${index}.code`)} />
                                        </div>
                                        <div className="col-md-4">
                                            <label className="form-label">
                                                <HelpLabel help="Bu birimin ekranda kullanıcıya görünecek adıdır. Satış planı ve fiyatlandırma kuralı seçicilerinde bu ad üzerinden anlaşılır.">
                                                    Ürün birim adı
                                                </HelpLabel>
                                            </label>
                                            <input className="form-control" {...register(`productUnits.${index}.name`)} />
                                        </div>
                                        <div className="col-md-5">
                                            <label className="form-label">
                                                <HelpLabel help="Bu birimin hangi fiyatlandırma senaryosu için kullanılacağını açıklayan opsiyonel nottur. Örneğin kullanıcı başına, şube başına veya işlem adedi gibi bağlam yazılabilir.">
                                                    Birim açıklaması
                                                </HelpLabel>
                                            </label>
                                            <input className="form-control" {...register(`productUnits.${index}.description`)} />
                                        </div>
                                        <div className="col-md-2">
                                            <label className="form-label">
                                                <HelpLabel help="Birimlerin listelerde hangi sırayla gösterileceğini belirler. Küçük sayı daha önce görünür.">
                                                    Gösterim sırası
                                                </HelpLabel>
                                            </label>
                                            <input
                                                type="number"
                                                min="0"
                                                className="form-control"
                                                {...register(`productUnits.${index}.sortOrder`, { valueAsNumber: true })}
                                            />
                                        </div>
                                        <div className="col-md-4 d-flex flex-wrap gap-4">
                                            <div className="form-check form-switch">
                                                <input
                                                    type="checkbox"
                                                    className="form-check-input"
                                                    id={`product-unit-default-${field.id}`}
                                                    checked={Boolean(unit?.isDefault)}
                                                    onChange={(event) => setDefault(index, event.target.checked)}
                                                />
                                                <label className="form-check-label" htmlFor={`product-unit-default-${field.id}`}>
                                                    <HelpLabel help="Bu ürün için ana veya varsayılan fiyatlandırma birimini belirtir. Plan veya kural tarafında özel seçim yapılmadığında referans alınacak birim olarak kullanılabilir.">
                                                        Varsayılan birim
                                                    </HelpLabel>
                                                </label>
                                            </div>
                                            <div className="form-check form-switch">
                                                <input
                                                    type="checkbox"
                                                    className="form-check-input"
                                                    id={`product-unit-active-${field.id}`}
                                                    {...register(`productUnits.${index}.isActive`)}
                                                />
                                                <label className="form-check-label" htmlFor={`product-unit-active-${field.id}`}>
                                                    <HelpLabel help="Pasif birimler ürün üzerinde saklanır ancak yeni satış planı ve fiyatlandırma kuralı seçimlerinde aktif birim gibi kullanılmaz.">
                                                        Birim aktif
                                                    </HelpLabel>
                                                </label>
                                            </div>
                                        </div>
                                        <div className="col-12 d-flex flex-wrap justify-content-end align-items-center gap-2 border-top pt-3 h-100">
                                            <button
                                                type="button"
                                                className="btn btn-primary"
                                                disabled={saving}
                                                onClick={() => void saveUnit(index)}
                                            >
                                                {saving ? (
                                                    <>
                                                        <span className="spinner-border spinner-border-sm me-2" />
                                                        Kaydediliyor...
                                                    </>
                                                ) : (
                                                    <>
                                                        <em className={`icon ni ni-${saved ? "save" : "plus"} me-1`} />
                                                        {saved ? "Birimi Güncelle" : "Birimi Ekle"}
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                    </Collapse>
                                </div>
                                            </div>
                                        )}
                                    </SortableUnitCard>
                                );
                            })}
                        </div>
                    </SortableContext>
                </DndContext>
            )}

            <Modal isOpen={quickAddIndex != null} toggle={closeQuickAdd} centered>
                <ModalHeader toggle={closeQuickAdd}>Birim Sözlüğü Ekle</ModalHeader>
                <ModalBody>
                    <div className="row g-3">
                        <div className="col-md-4">
                            <label className="form-label">
                                <HelpLabel help="Birim sözlüğüne eklenecek kısa koddur. Kod daha sonra ürün birimi seçildiğinde ürün içi kod alanına da aktarılır.">
                                    Sözlük kodu
                                </HelpLabel>{" "}
                                <span className="text-danger">*</span>
                            </label>
                            <input
                                className="form-control text-uppercase"
                                placeholder="ADET"
                                value={quickDefinition.code}
                                onChange={(event) =>
                                    setQuickDefinition((current) => ({ ...current, code: event.target.value.toUpperCase() }))
                                }
                                disabled={creatingDefinition}
                            />
                        </div>
                        <div className="col-md-8">
                            <label className="form-label">
                                <HelpLabel help="Birim sözlüğünde görünecek anlaşılır addır. Örneğin Adet, Kullanıcı, Cihaz veya API Çağrısı gibi iş dilindeki ad kullanılmalıdır.">
                                    Sözlük adı
                                </HelpLabel>{" "}
                                <span className="text-danger">*</span>
                            </label>
                            <input
                                className="form-control"
                                placeholder="Adet"
                                value={quickDefinition.name}
                                onChange={(event) =>
                                    setQuickDefinition((current) => ({ ...current, name: event.target.value }))
                                }
                                disabled={creatingDefinition}
                            />
                        </div>
                        <div className="col-12">
                            <label className="form-label">
                                <HelpLabel help="Birim sözlüğü kaydının ne için kullanılacağını açıklayan opsiyonel bilgidir. Benzer birimler arasında ayrım yapmayı kolaylaştırır.">
                                    Sözlük açıklaması
                                </HelpLabel>
                            </label>
                            <input
                                className="form-control"
                                placeholder="Opsiyonel açıklama..."
                                value={quickDefinition.description}
                                onChange={(event) =>
                                    setQuickDefinition((current) => ({ ...current, description: event.target.value }))
                                }
                                disabled={creatingDefinition}
                            />
                        </div>
                    </div>
                </ModalBody>
                <ModalFooter>
                    <Button color="light" onClick={closeQuickAdd} disabled={creatingDefinition}>
                        İptal
                    </Button>
                    <Button color="primary" onClick={() => void createUnitDefinition()} disabled={creatingDefinition}>
                        {creatingDefinition ? (
                            <>
                                <span className="spinner-border spinner-border-sm me-2" />
                                Kaydediliyor...
                            </>
                        ) : (
                            <>
                                <em className="icon ni ni-plus me-1" />
                                Ekle
                            </>
                        )}
                    </Button>
                </ModalFooter>
            </Modal>
        </div>
    );
};

export default ProductUnitsTab;
