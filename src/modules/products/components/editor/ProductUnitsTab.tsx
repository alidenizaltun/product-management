import React, { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useFieldArray, useFormContext, useWatch } from "react-hook-form";
import { Button, Modal, ModalBody, ModalFooter, ModalHeader } from "reactstrap";
import { unitDefinitionsApi } from "@/services/unitDefinitions/unitDefinitions.api";
import { productsApi } from "@/modules/products/api/products.api";
import { showApiError, showSuccess, showWarning } from "@/modules/shared/components/NotificationAlert";
import { queryKeys } from "@/services/query/queryKeys";
import type { ProductFormValues, ProductUnitForm } from "@/modules/products/types/productEditor.types";
import type { CreateProductUnitRequestDto, UnitDefinitionDto, UnitRole } from "@/shared/types/productOperations.types";
import { UNIT_ROLE_LABELS } from "@/shared/types/productOperations.types";

const generateTempId = () => `product-unit-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const EMPTY_UNIT: ProductUnitForm = {
    _tempId: "",
    unitDefinitionId: "",
    code: "",
    name: "",
    description: "",
    role: 1,
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

const ProductUnitsTab: React.FC<ProductUnitsTabProps> = ({ productId }) => {
    const queryClient = useQueryClient();
    const { control, register, setValue, getValues } = useFormContext<ProductFormValues>();
    const { fields, append, remove, swap } = useFieldArray({ control, name: "productUnits" });
    const productUnits = useWatch({ control, name: "productUnits" }) ?? [];
    const [unitDefinitions, setUnitDefinitions] = useState<UnitDefinitionDto[]>([]);
    const [savingIndex, setSavingIndex] = useState<number | null>(null);
    const [quickAddIndex, setQuickAddIndex] = useState<number | null>(null);
    const [quickDefinition, setQuickDefinition] = useState<QuickUnitDefinitionForm>(EMPTY_QUICK_DEFINITION);
    const [creatingDefinition, setCreatingDefinition] = useState(false);

    useEffect(() => {
        unitDefinitionsApi.getAll().then(setUnitDefinitions).catch(() => setUnitDefinitions([]));
    }, []);

    const addUnit = () => {
        append({
            ...EMPTY_UNIT,
            _tempId: generateTempId(),
            isDefault: fields.length === 0,
            sortOrder: fields.length,
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
            role: Number(unit.role) as UnitRole,
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
            if (offering.productUnitTempId !== tempId) return;
            setValue(`licenseOfferings.${index}.productUnitId`, createdId, { shouldDirty: true });
            setValue(`licenseOfferings.${index}.productUnitTempId`, undefined, { shouldDirty: true });
        });

        const pricingRules = getValues("pricingRules") ?? [];
        pricingRules.forEach((rule, index) => {
            if (rule.productUnitTempId !== tempId) return;
            setValue(`pricingRules.${index}.productUnitId`, createdId, { shouldDirty: true });
            setValue(`pricingRules.${index}.productUnitTempId`, undefined, { shouldDirty: true });
        });
    };

    const saveUnit = async (index: number) => {
        const unit = getValues(`productUnits.${index}`);
        const payload = buildPayload(unit);
        if (!payload) return;

        if (!productId) {
            showSuccess("Birim taslağa eklendi. Ürün kaydedildiğinde backend'e gönderilecek.");
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
                <div className="d-flex flex-column gap-3 h-100">
                    {fields.map((field, index) => {
                        const unit = productUnits[index];
                        const saved = Boolean(unit?.id);
                        const saving = savingIndex === index;
                        return (
                            <div className="card card-bordered" key={field.id}>
                                <div className="card-inner">
                                    <div className="d-flex justify-content-between align-items-start gap-3 mb-3 h-100">
                                        <div>
                                            <span className="badge badge-dim bg-primary mb-1">
                                                {UNIT_ROLE_LABELS[(Number(unit?.role) as UnitRole) || 1]}
                                            </span>
                                            <h6 className="title mb-0">{unit?.name || `Birim #${index + 1}`}</h6>
                                            <p className="text-soft fs-12px mb-0">
                                                {unit?.code || "Kod bekleniyor"}
                                                {unit?.isDefault ? " · Varsayılan" : ""}
                                            </p>
                                        </div>
                                        <div className="d-flex gap-1 h-100">
                                            <button
                                                type="button"
                                                className="btn btn-sm btn-icon btn-outline-light"
                                                disabled={index === 0}
                                                onClick={() => swap(index, index - 1)}
                                                title="Yukarı taşı"
                                            >
                                                <em className="icon ni ni-chevron-up" />
                                            </button>
                                            <button
                                                type="button"
                                                className="btn btn-sm btn-icon btn-outline-light"
                                                disabled={index === fields.length - 1}
                                                onClick={() => swap(index, index + 1)}
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

                                    <div className="row g-3 align-items-end">
                                        <div className="col-md-4">
                                            <label className="form-label">Birim sözlüğü</label>
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
                                        <div className="col-md-2">
                                            <label className="form-label">Ürün içi kod</label>
                                            <input className="form-control" {...register(`productUnits.${index}.code`)} />
                                        </div>
                                        <div className="col-md-3">
                                            <label className="form-label">Ürün içi ad</label>
                                            <input className="form-control" {...register(`productUnits.${index}.name`)} />
                                        </div>
                                        <div className="col-md-3">
                                            <label className="form-label">Rol</label>
                                            <select
                                                className="form-select"
                                                {...register(`productUnits.${index}.role`, { valueAsNumber: true })}
                                            >
                                                {Object.entries(UNIT_ROLE_LABELS).map(([value, label]) => (
                                                    <option key={value} value={value}>
                                                        {label}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label">Açıklama</label>
                                            <input className="form-control" {...register(`productUnits.${index}.description`)} />
                                        </div>
                                        <div className="col-md-2">
                                            <label className="form-label">Sıra</label>
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
                                                    Varsayılan
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
                                                    Aktif
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
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            <Modal isOpen={quickAddIndex != null} toggle={closeQuickAdd} centered>
                <ModalHeader toggle={closeQuickAdd}>Birim Sözlüğü Ekle</ModalHeader>
                <ModalBody>
                    <div className="row g-3">
                        <div className="col-md-4">
                            <label className="form-label">
                                Kod <span className="text-danger">*</span>
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
                                Ad <span className="text-danger">*</span>
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
                            <label className="form-label">Açıklama</label>
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
