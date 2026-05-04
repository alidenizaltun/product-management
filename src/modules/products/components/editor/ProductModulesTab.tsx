import React from "react";
import { useFieldArray, useFormContext } from "react-hook-form";
import { ProductFormValues } from "@/modules/products/types/productEditor.types";

const EMPTY_MODULE = {
    moduleCode: "",
    name: "",
    description: "",
    additionalPrice: 0,
    currencyCode: "TRY",
    isOptional: true,
    isActive: true,
    sortOrder: 0,
};

const ProductModulesTab: React.FC = () => {
    const {
        register,
        control,
        formState: { errors },
    } = useFormContext<ProductFormValues>();
    const { fields, append, remove } = useFieldArray({ control, name: "modules" });

    return (
        <div >
            <div className="d-flex align-items-center justify-content-between mb-3">
                <div>
                    <h6 className="overline-title text-primary mb-0">Ürün Modülleri</h6>
                    <p className="text-soft fs-12 mb-0">
                        CRM modülü, Raporlama modülü gibi ek modülleri ve fiyatlarını tanımlayın.
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
                <div className="d-flex flex-column gap-3 h-100 h-100">
                    {fields.map((field, index) => (
                        <div key={field.id} className="card card-bordered">
                            <div className="card-inner">
                                <div className="d-flex align-items-center justify-content-between mb-3">
                                    <span className="badge bg-primary-soft text-primary">Modül #{index + 1}</span>
                                    <button
                                        type="button"
                                        className="btn btn-sm btn-icon btn-outline-danger"
                                        onClick={() => remove(index)}
                                        title="Modülü Kaldır"
                                    >
                                        <em className="icon ni ni-trash" />
                                    </button>
                                </div>
                                <div className="row g-3">
                                    <div className="col-md-3">
                                        <label className="form-label">
                                            Modül Kodu <span className="text-danger">*</span>
                                        </label>
                                        <input
                                            className="form-control"
                                            placeholder="MOD-CRM"
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
                                    <div className="col-md-2">
                                        <label className="form-label">Ek Fiyat</label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            className="form-control"
                                            placeholder="0.00"
                                            {...register(`modules.${index}.additionalPrice`, { valueAsNumber: true })}
                                        />
                                    </div>
                                    <div className="col-md-2">
                                        <label className="form-label">Para Birimi</label>
                                        <input
                                            className="form-control"
                                            placeholder="TRY"
                                            {...register(`modules.${index}.currencyCode`)}
                                        />
                                    </div>
                                    <div className="col-12">
                                        <label className="form-label">Açıklama</label>
                                        <input
                                            className="form-control"
                                            placeholder="Modül hakkında kısa açıklama..."
                                            {...register(`modules.${index}.description`)}
                                        />
                                    </div>
                                    <div className="col-md-2">
                                        <label className="form-label">Sıra</label>
                                        <input
                                            type="number"
                                            min="0"
                                            className="form-control"
                                            placeholder="1"
                                            {...register(`modules.${index}.sortOrder`, { valueAsNumber: true })}
                                        />
                                    </div>
                                    <div className="col-md-10 d-flex align-items-end pb-1 gap-4">
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
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ProductModulesTab;
