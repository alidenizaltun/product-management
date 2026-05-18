import React, { useEffect, useState } from "react";
import { useFieldArray, useFormContext } from "react-hook-form";
import { ProductFormValues } from "@/modules/products/types/productEditor.types";
import { unitDefinitionsApi } from "@/services/unitDefinitions/unitDefinitions.api";
import { UnitDefinitionDto, UNIT_ROLE_LABELS, UnitRole } from "@/shared/types/productOperations.types";

const EMPTY_CONVERSION = {
    fromUnitDefinitionId: "",
    toUnitDefinitionId: "",
    conversionFactor: 1,
    fromUnitRole: 3 as UnitRole,
    isActive: true,
};

const UNIT_ROLE_OPTIONS: { value: UnitRole; label: string }[] = [
    { value: 1, label: UNIT_ROLE_LABELS[1] },
    { value: 2, label: UNIT_ROLE_LABELS[2] },
    { value: 3, label: UNIT_ROLE_LABELS[3] },
];

const ProductUnitConversionTab: React.FC = () => {
    const {
        register,
        control,
        formState: { errors },
    } = useFormContext<ProductFormValues>();

    const { fields, append, remove } = useFieldArray({ control, name: "unitConversions" });
    const [unitOptions, setUnitOptions] = useState<{ value: string; label: string }[]>([]);

    useEffect(() => {
        unitDefinitionsApi.getAll().then((units: UnitDefinitionDto[]) => {
            setUnitOptions(
                units
                    .filter((u) => u.isActive)
                    .map((u) => ({ value: u.id, label: `${u.name} (${u.code})` }))
            );
        });
    }, []);

    return (
        <div>
            <div className="d-flex align-items-center justify-content-between mb-3">
                <div>
                    <h6 className="overline-title text-primary mb-0">Birim Dönüşümleri</h6>
                    <p className="text-soft fs-12 mb-0">
                        Alım, satış ve stok takibi için farklı birimler tanımlayın (ör: 1 Koli = 24 Adet).
                    </p>
                </div>
                <button
                    type="button"
                    className="btn btn-sm btn-outline-primary"
                    onClick={() => append({ ...EMPTY_CONVERSION })}
                >
                    <em className="icon ni ni-plus me-1" />
                    Dönüşüm Ekle
                </button>
            </div>

            {fields.length === 0 ? (
                <div className="text-center py-5 text-soft">
                    <em className="icon ni ni-exchange fs-2 d-block mb-2" />
                    <p className="mb-0">
                        Henüz birim dönüşümü eklenmemiş. Fiziksel ürünler için alım, satış ve stok birimlerini tanımlayabilirsiniz.
                    </p>
                </div>
            ) : (
                <div className="d-flex flex-column gap-3">
                    {fields.map((field, index) => (
                        <div key={field.id} className="card card-bordered">
                            <div className="card-inner">
                                <div className="d-flex align-items-center justify-content-between mb-3">
                                    <span className="badge bg-primary-soft text-primary">Dönüşüm #{index + 1}</span>
                                    <button
                                        type="button"
                                        className="btn btn-sm btn-icon btn-outline-danger"
                                        onClick={() => remove(index)}
                                        title="Dönüşümü Kaldır"
                                    >
                                        <em className="icon ni ni-trash" />
                                    </button>
                                </div>
                                <div className="row g-3">
                                    {/* Kaynak Birim */}
                                    <div className="col-md-3">
                                        <label className="form-label">
                                            Kaynak Birim <span className="text-danger">*</span>
                                        </label>
                                        <select
                                            className="form-select"
                                            {...register(`unitConversions.${index}.fromUnitDefinitionId`)}
                                        >
                                            <option value="">Seçiniz...</option>
                                            {unitOptions.map((opt) => (
                                                <option key={opt.value} value={opt.value}>
                                                    {opt.label}
                                                </option>
                                            ))}
                                        </select>
                                        {errors.unitConversions?.[index]?.fromUnitDefinitionId && (
                                            <span className="text-danger fs-12">
                                                {errors.unitConversions[index]?.fromUnitDefinitionId?.message}
                                            </span>
                                        )}
                                    </div>

                                    {/* Hedef Birim */}
                                    <div className="col-md-3">
                                        <label className="form-label">
                                            Hedef Birim <span className="text-danger">*</span>
                                        </label>
                                        <select
                                            className="form-select"
                                            {...register(`unitConversions.${index}.toUnitDefinitionId`)}
                                        >
                                            <option value="">Seçiniz...</option>
                                            {unitOptions.map((opt) => (
                                                <option key={opt.value} value={opt.value}>
                                                    {opt.label}
                                                </option>
                                            ))}
                                        </select>
                                        {errors.unitConversions?.[index]?.toUnitDefinitionId && (
                                            <span className="text-danger fs-12">
                                                {errors.unitConversions[index]?.toUnitDefinitionId?.message}
                                            </span>
                                        )}
                                    </div>

                                    {/* Çevrim Oranı */}
                                    <div className="col-md-2">
                                        <label className="form-label">
                                            Oran <span className="text-danger">*</span>
                                        </label>
                                        <input
                                            type="number"
                                            step="0.0001"
                                            min="0.0001"
                                            className="form-control"
                                            placeholder="1"
                                            {...register(`unitConversions.${index}.conversionFactor`, {
                                                valueAsNumber: true,
                                            })}
                                        />
                                        <div className="form-note">1 Kaynak = ? Hedef</div>
                                        {errors.unitConversions?.[index]?.conversionFactor && (
                                            <span className="text-danger fs-12">
                                                {errors.unitConversions[index]?.conversionFactor?.message}
                                            </span>
                                        )}
                                    </div>

                                    {/* Kaynak Birimin Rolü */}
                                    <div className="col-md-3">
                                        <label className="form-label">
                                            Kaynak Birimin Rolü <span className="text-danger">*</span>
                                        </label>
                                        <select
                                            className="form-select"
                                            {...register(`unitConversions.${index}.fromUnitRole`, {
                                                valueAsNumber: true,
                                            })}
                                        >
                                            {UNIT_ROLE_OPTIONS.map((opt) => (
                                                <option key={opt.value} value={opt.value}>
                                                    {opt.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Aktif */}
                                    <div className="col-md-1 d-flex align-items-end pb-1">
                                        <div className="form-check form-switch">
                                            <input
                                                type="checkbox"
                                                className="form-check-input"
                                                id={`conv-active-${index}`}
                                                {...register(`unitConversions.${index}.isActive`)}
                                            />
                                            <label className="form-check-label" htmlFor={`conv-active-${index}`}>
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

export default ProductUnitConversionTab;
