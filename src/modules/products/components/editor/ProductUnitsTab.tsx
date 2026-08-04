import React, { useEffect, useId, useState } from "react";
import { arrayMove } from "@dnd-kit/sortable";
import { useQueryClient } from "@tanstack/react-query";
import { useFieldArray, useFormContext, useWatch } from "react-hook-form";
import { Button, Modal, ModalBody, ModalFooter, ModalHeader, UncontrolledTooltip } from "reactstrap";
import { unitDefinitionsApi } from "@/services/unitDefinitions/unitDefinitions.api";
import { productsApi } from "@/modules/products/api/products.api";
import ConfirmDialog from "@/modules/shared/components/ConfirmDialog";
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

const ProductUnitsTab: React.FC<ProductUnitsTabProps> = ({ productId }) => {
    const queryClient = useQueryClient();
    const { control, register, setValue, getValues, reset } = useFormContext<ProductFormValues>();
    const { fields, append, remove, move } = useFieldArray({ control, name: "productUnits" });
    const productUnits = useWatch({ control, name: "productUnits" }) ?? [];
    const [unitDefinitions, setUnitDefinitions] = useState<UnitDefinitionDto[]>([]);
    const [savingIndex, setSavingIndex] = useState<number | null>(null);
    const [quickAddIndex, setQuickAddIndex] = useState<number | null>(null);
    const [quickDefinition, setQuickDefinition] = useState<QuickUnitDefinitionForm>(EMPTY_QUICK_DEFINITION);
    const [creatingDefinition, setCreatingDefinition] = useState(false);
    const [editingUnitIndex, setEditingUnitIndex] = useState<number | null>(null);
    const [pendingDeleteIndex, setPendingDeleteIndex] = useState<number | null>(null);
    const [deleting, setDeleting] = useState(false);
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
        setEditingUnitIndex(fields.length);
    };

    const closeUnitEditor = () => setEditingUnitIndex(null);

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
        const usedByAnotherUnit = productUnits.some(
            (unit, unitIndex) => unitIndex !== index && unit.unitDefinitionId === unitDefinitionId
        );
        if (usedByAnotherUnit) {
            showWarning("Bu birim sözlüğü bu üründe zaten kullanılıyor.");
            return;
        }

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

    const requestRemoveUnit = (index: number) => {
        const unit = productUnits[index];
        if (unit?.id) {
            setPendingDeleteIndex(index);
        } else {
            remove(index);
        }
    };

    const confirmRemoveUnit = async () => {
        if (pendingDeleteIndex == null) return;
        const unit = productUnits[pendingDeleteIndex];

        if (!unit?.id) {
            remove(pendingDeleteIndex);
            setPendingDeleteIndex(null);
            return;
        }

        try {
            setDeleting(true);
            await productsApi.deleteProductUnit(unit.id);
            remove(pendingDeleteIndex);
            await invalidateProductUnits();
            reset(getValues());
            showSuccess("Ürün birimi silindi.");
            setPendingDeleteIndex(null);
        } catch (error) {
            showApiError(error);
        } finally {
            setDeleting(false);
        }
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

        if (!productId) {
            showSuccess("Birim taslağa eklendi. Ürün kaydedildiğinde backend'e gönderilecek.");
            closeUnitEditor();
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
            reset(getValues());
            closeUnitEditor();
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
                <div className="table-responsive">
                    <table className="table table-middle mb-0">
                        <thead className="table-light">
                            <tr>
                                <th>Birim adı</th>
                                <th>Kod</th>
                                <th>Sıra</th>
                                <th>Durum</th>
                                <th className="text-end">İşlem</th>
                            </tr>
                        </thead>
                        <tbody>
                            {fields.map((field, index) => {
                                const unit = productUnits[index];
                                const saved = Boolean(unit?.id);
                                const saving = savingIndex === index;
                                return (
                                    <tr key={field.id}>
                                        <td>
                                            <div className="fw-medium">{unit?.name || `Birim #${index + 1}`}</div>
                                            {unit?.isDefault && <span className="badge bg-outline-primary mt-1">Varsayılan</span>}
                                            <input type="hidden" {...register(`productUnits.${index}.sortOrder`, { valueAsNumber: true })} />
                                        </td>
                                        <td>{unit?.code || "Kod bekleniyor"}</td>
                                        <td>{index + 1}</td>
                                        <td>
                                            <span className={`badge bg-${unit?.isActive ? "success" : "secondary"}`}>
                                                {unit?.isActive ? "Aktif" : "Pasif"}
                                            </span>
                                        </td>
                                        <td className="text-end">
                                            <div className="d-inline-flex flex-wrap justify-content-end gap-1">
                                                <button
                                                    type="button"
                                                    className="btn btn-sm btn-outline-primary"
                                                    onClick={() => setEditingUnitIndex(index)}
                                                >
                                                    <em className="icon ni ni-edit me-1" />
                                                    Düzenle
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
                                                    onClick={() => requestRemoveUnit(index)}
                                                    title="Birimi kaldır"
                                                >
                                                    <em className="icon ni ni-trash" />
                                                </button>
                                            </div>
                                        </td>

                                        <Modal isOpen={editingUnitIndex === index} toggle={closeUnitEditor} size="lg" centered>
                                            <ModalHeader toggle={closeUnitEditor}>
                                                {saved ? "Ürün Birimini Güncelle" : "Ürün Birimi Ekle"}
                                            </ModalHeader>
                                            <ModalBody className="pricing-manager-modal-body">
                                                <div className="pricing-manager-modal-intro">
                                                    <span className="overline-title text-primary">Birim bilgileri</span>
                                                    <p className="text-soft fs-13px mb-0">
                                                        Fiyatlandırmada kullanılacak ürün içi birimi ve durumunu tanımlayın.
                                                    </p>
                                                </div>
                                                <div className="pricing-form-grid">
                                                    <div className="pricing-form-field">
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
                                                                {unitDefinitions.map((definition) => {
                                                                    const usedByAnotherUnit = productUnits.some(
                                                                        (productUnit, unitIndex) =>
                                                                            unitIndex !== index &&
                                                                            productUnit.unitDefinitionId === definition.id
                                                                    );

                                                                    return (
                                                                        <option
                                                                            key={definition.id}
                                                                            value={definition.id}
                                                                            disabled={usedByAnotherUnit}
                                                                        >
                                                                            {definition.name} ({definition.code})
                                                                            {usedByAnotherUnit ? " - kullanımda" : ""}
                                                                        </option>
                                                                    );
                                                                })}
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
                                                    {/* <div className="pricing-form-field">
                                                        <label className="form-label">
                                                            <HelpLabel help="Bu kod, seçtiğiniz birim sözlüğünden otomatik alınır. Elle girmenize gerek yoktur; değiştirmek için farklı bir birim sözlüğü seçin.">
                                                                Ürün birim kodu
                                                            </HelpLabel>
                                                        </label>
                                                        <input
                                                            className="form-control"
                                                            value={unit?.code || ""}
                                                            placeholder="Birim sözlüğü seçilince otomatik doldurulur"
                                                            disabled
                                                            readOnly
                                                        />
                                                    </div> */}
                                                    <div className="pricing-form-field">
                                                        <label className="form-label">
                                                            <HelpLabel help="Bu birimin ekranda kullanıcıya görünecek adıdır. Satış planı ve fiyatlandırma kuralı seçicilerinde bu ad üzerinden anlaşılır.">
                                                                Ürün birim adı
                                                            </HelpLabel>
                                                        </label>
                                                        <input className="form-control" {...register(`productUnits.${index}.name`)} />
                                                    </div>
                                                    <div className="pricing-form-field pricing-form-field--full">
                                                        <label className="form-label">
                                                            <HelpLabel help="Bu birimin hangi fiyatlandırma senaryosu için kullanılacağını açıklayan opsiyonel nottur. Örneğin kullanıcı başına, şube başına veya işlem adedi gibi bağlam yazılabilir.">
                                                                Birim açıklaması
                                                            </HelpLabel>
                                                        </label>
                                                        <input className="form-control" {...register(`productUnits.${index}.description`)} />
                                                    </div>
                                                    <div className="pricing-form-field pricing-form-field--wide d-flex flex-wrap gap-4">
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
                                                    <div className="pricing-form-field pricing-form-field--full d-flex flex-wrap justify-content-end align-items-center gap-2 border-top pt-3 h-100">
                                                        <Button color="light" type="button" onClick={closeUnitEditor} disabled={saving}>
                                                            Kapat
                                                        </Button>
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
                                            </ModalBody>
                                        </Modal>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
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

            <ConfirmDialog
                open={pendingDeleteIndex != null}
                title="Ürün Birimini Sil"
                message="Bu ürün birimi kalıcı olarak silinecek. Devam etmek istiyor musunuz?"
                variant="danger"
                confirmLabel="Sil"
                loading={deleting}
                onConfirm={() => void confirmRemoveUnit()}
                onCancel={() => setPendingDeleteIndex(null)}
            />
        </div>
    );
};

export default ProductUnitsTab;
