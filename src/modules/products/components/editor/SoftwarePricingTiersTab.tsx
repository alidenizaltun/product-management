import React, { useEffect, useState } from "react";
import { useFieldArray, useFormContext, useWatch, Controller } from "react-hook-form";
import { Modal, ModalHeader, ModalBody, ModalFooter, Button } from "reactstrap";
import { useForm } from "react-hook-form";
import { ProductFormValues } from "@/modules/products/types/productEditor.types";
import { unitDefinitionsApi } from "@/services/unitDefinitions/unitDefinitions.api";
import { useUnitDefinitionMutations } from "@/modules/catalog/hooks/useUnitDefinitions";
import type { LookupItem } from "@/services/lookup/lookups.api";

const EMPTY_TIER = {
    productLicenseOfferingId: undefined as string | undefined,
    licenseOfferingTempId: undefined as string | undefined,
    unitDefinitionId: "",
    minUnits: 1,
    maxUnits: undefined as number | undefined,
    pricePerUnit: 0,
    flatFee: 0,
    currencyCode: "TRY",
    isActive: true,
};

interface QuickUnitForm {
    code: string;
    name: string;
    description?: string;
    sortOrder: number;
}

const SoftwarePricingTiersTab: React.FC = () => {
    const {
        register,
        control,
        setValue,
        formState: { errors },
    } = useFormContext<ProductFormValues>();
    const { fields, append, remove } = useFieldArray({ control, name: "softwarePricingTiers" });

    const licenseOfferings = useWatch({ control, name: "licenseOfferings" }) ?? [];
    // Kaydedilmiş (id) veya yeni eklenmiş (_tempId) tüm teklifleri göster
    const allOfferings = licenseOfferings.filter((lo) => Boolean(lo.id) || Boolean(lo._tempId));

    const [unitOptions, setUnitOptions] = useState<LookupItem[]>([]);
    const [showUnitModal, setShowUnitModal] = useState(false);
    const [targetTierIndex, setTargetTierIndex] = useState<number | null>(null);

    const { create: createUnit } = useUnitDefinitionMutations();

    const quickUnitForm = useForm<QuickUnitForm>({
        defaultValues: { code: "", name: "", description: "", sortOrder: 0 },
    });

    useEffect(() => {
        unitDefinitionsApi.getLookup().then(setUnitOptions).catch(() => { });
    }, []);

    const openUnitModal = (index: number) => {
        setTargetTierIndex(index);
        quickUnitForm.reset({ code: "", name: "", description: "", sortOrder: 0 });
        setShowUnitModal(true);
    };

    const handleCreateUnit = async (values: QuickUnitForm, e?: React.BaseSyntheticEvent) => {
        e?.stopPropagation();
        const created = await createUnit.mutateAsync({
            code: values.code,
            name: values.name,
            description: values.description || undefined,
            isActive: true,
            sortOrder: values.sortOrder,
        });
        const updated = await unitDefinitionsApi.getLookup();
        setUnitOptions(updated);
        if (targetTierIndex !== null) {
            setValue(
                `softwarePricingTiers.${targetTierIndex}.unitDefinitionId`,
                created.id,
                { shouldDirty: true }
            );
        }
        setShowUnitModal(false);
    };

    return (
        <div>
            <div className="d-flex align-items-center justify-content-between mb-3">
                <div>
                    <h6 className="overline-title text-primary mb-0">Kademeli Fiyatlandırma</h6>
                    <p className="text-soft fs-12 mb-0">
                        Birim sayısına göre kademeli fiyat tanımlayın. Önce Lisans Teklifleri sekmesinde teklif oluşturun.
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

            {allOfferings.length === 0 && (
                <div className="alert alert-warning d-flex align-items-center gap-2 mb-3">
                    <em className="icon ni ni-alert-circle" />
                    <span>
                        Fiyat kademesi eklemek için önce <strong>Lisans Teklifleri</strong> sekmesinde teklif oluşturun.
                    </span>
                </div>
            )}

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
                                        <label className="form-label">
                                            Lisans Teklifi <span className="text-danger">*</span>
                                        </label>
                                        {/* Seçili değer: kaydedilmişse id, yeniyse _tempId */}
                                        <select
                                            className="form-control form-select"
                                            value={
                                                fields[index]
                                                    ? (fields[index] as Record<string, unknown>).productLicenseOfferingId as string ||
                                                    (fields[index] as Record<string, unknown>).licenseOfferingTempId as string ||
                                                    ""
                                                    : ""
                                            }
                                            onChange={(e) => {
                                                const selectedKey = e.target.value;
                                                const offering = allOfferings.find(
                                                    (lo) => lo.id === selectedKey || lo._tempId === selectedKey
                                                );
                                                if (!offering) {
                                                    setValue(`softwarePricingTiers.${index}.productLicenseOfferingId`, undefined, { shouldDirty: true });
                                                    setValue(`softwarePricingTiers.${index}.licenseOfferingTempId`, undefined, { shouldDirty: true });
                                                } else if (offering.id) {
                                                    // Kaydedilmiş offering → id ile referans ver
                                                    setValue(`softwarePricingTiers.${index}.productLicenseOfferingId`, offering.id, { shouldDirty: true });
                                                    setValue(`softwarePricingTiers.${index}.licenseOfferingTempId`, undefined, { shouldDirty: true });
                                                } else {
                                                    // Yeni offering → tempId ile referans ver
                                                    setValue(`softwarePricingTiers.${index}.productLicenseOfferingId`, undefined, { shouldDirty: true });
                                                    setValue(`softwarePricingTiers.${index}.licenseOfferingTempId`, offering._tempId, { shouldDirty: true });
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
                                        {allOfferings.length === 0 && (
                                            <small className="text-soft">Önce Lisans Teklifleri sekmesinden teklif ekleyin.</small>
                                        )}
                                    </div>

                                    {/* Birim Tanımı + inline "+" butonu */}
                                    <div className="col-md-4">
                                        <label className="form-label">
                                            Birim Tanımı <span className="text-danger">*</span>
                                        </label>
                                        <div className="input-group">
                                            <Controller
                                                control={control}
                                                name={`softwarePricingTiers.${index}.unitDefinitionId`}
                                                render={({ field }) => (
                                                    <select
                                                        className="form-control form-select"
                                                        value={field.value ?? ""}
                                                        onChange={field.onChange}
                                                        onBlur={field.onBlur}
                                                        ref={field.ref}
                                                    >
                                                        <option value="">— Seçiniz —</option>
                                                        {unitOptions.map((u) => (
                                                            <option key={u.id} value={u.id}>
                                                                {u.name}
                                                            </option>
                                                        ))}
                                                    </select>
                                                )}
                                            />
                                            <button
                                                type="button"
                                                className="btn btn-outline-primary px-2"
                                                title="Yeni birim tanımı ekle"
                                                onClick={() => openUnitModal(index)}
                                            >
                                                <em className="icon ni ni-plus" />
                                            </button>
                                        </div>
                                        <small className="text-soft">Listede yoksa + ile hızlı ekleyin.</small>
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

            {/* Hızlı Birim Ekleme Modalı — form submit'i üst forma bubble etmemesi için stopPropagation */}
            <Modal isOpen={showUnitModal} toggle={() => setShowUnitModal(false)} size="md">
                <form
                    onSubmit={(e) => {
                        e.stopPropagation();
                        quickUnitForm.handleSubmit(handleCreateUnit)(e);
                    }}
                >
                    <ModalHeader toggle={() => setShowUnitModal(false)}>
                        Yeni Birim Tanımı Ekle
                    </ModalHeader>
                    <ModalBody>
                        <div className="row g-3">
                            <div className="col-md-5">
                                <label className="form-label">
                                    Kod <span className="text-danger">*</span>
                                </label>
                                <input
                                    className={`form-control text-uppercase ${quickUnitForm.formState.errors.code ? "is-invalid" : ""}`}
                                    placeholder="USER"
                                    {...quickUnitForm.register("code", { required: "Kod zorunludur" })}
                                />
                                {quickUnitForm.formState.errors.code && (
                                    <div className="invalid-feedback">{quickUnitForm.formState.errors.code.message}</div>
                                )}
                                <small className="text-soft">Kısa kod. Örn: USER, LT, ADET</small>
                            </div>
                            <div className="col-md-5">
                                <label className="form-label">
                                    Ad <span className="text-danger">*</span>
                                </label>
                                <input
                                    className={`form-control ${quickUnitForm.formState.errors.name ? "is-invalid" : ""}`}
                                    placeholder="Kullanıcı"
                                    {...quickUnitForm.register("name", { required: "Ad zorunludur" })}
                                />
                                {quickUnitForm.formState.errors.name && (
                                    <div className="invalid-feedback">{quickUnitForm.formState.errors.name.message}</div>
                                )}
                            </div>
                            <div className="col-md-2">
                                <label className="form-label">Sıra</label>
                                <input
                                    type="number"
                                    min="0"
                                    className="form-control"
                                    placeholder="0"
                                    {...quickUnitForm.register("sortOrder", { valueAsNumber: true })}
                                />
                            </div>
                            <div className="col-12">
                                <label className="form-label">Açıklama</label>
                                <input
                                    className="form-control"
                                    placeholder="Opsiyonel..."
                                    {...quickUnitForm.register("description")}
                                />
                            </div>
                        </div>
                    </ModalBody>
                    <ModalFooter>
                        <Button color="light" type="button" onClick={() => setShowUnitModal(false)}>
                            İptal
                        </Button>
                        <Button color="primary" type="submit" disabled={createUnit.isPending}>
                            {createUnit.isPending ? (
                                <>
                                    <span className="spinner-border spinner-border-sm me-2" />
                                    Kaydediliyor...
                                </>
                            ) : (
                                "Ekle ve Seç"
                            )}
                        </Button>
                    </ModalFooter>
                </form>
            </Modal>
        </div>
    );
};

export default SoftwarePricingTiersTab;
