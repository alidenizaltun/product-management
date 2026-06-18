import React, { useState } from "react";
import { useModuleOfferingPrices } from "@/modules/products/hooks/useModuleOfferingPrices";
import type {
    ProductModuleOfferingPriceDto,
    CreateProductModuleOfferingPriceRequest,
    ProductLicenseOfferingDto,
} from "@/shared/types/productOperations.types";

interface FormState {
    productLicenseOfferingId: string;
    price: string;
    currencyCode: string;
    isActive: boolean;
}

const EMPTY_FORM: FormState = {
    productLicenseOfferingId: "",
    price: "",
    currencyCode: "TRY",
    isActive: true,
};

interface Props {
    productId: string;
    moduleId: string;
    licenseOfferings: ProductLicenseOfferingDto[];
    initialPrices?: ProductModuleOfferingPriceDto[];
}

const ModuleOfferingPricesPanel: React.FC<Props> = ({ productId, moduleId, licenseOfferings, initialPrices }) => {
    const { query, create, update, remove } = useModuleOfferingPrices(productId, moduleId, initialPrices);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState<FormState>(EMPTY_FORM);
    const [deleteId, setDeleteId] = useState<string | null>(null);

    const prices = query.data ?? [];
    const isLoading = query.isLoading;
    const isMutating = create.isPending || update.isPending || remove.isPending;

    const openCreate = () => {
        setEditingId(null);
        setForm(EMPTY_FORM);
        setShowForm(true);
    };

    const openEdit = (item: ProductModuleOfferingPriceDto) => {
        setEditingId(item.id);
        setForm({
            productLicenseOfferingId: item.productLicenseOfferingId,
            price: String(item.price),
            currencyCode: item.currencyCode,
            isActive: item.isActive,
        });
        setShowForm(true);
    };

    const closeForm = () => {
        setShowForm(false);
        setEditingId(null);
        setForm(EMPTY_FORM);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const payload = {
            productLicenseOfferingId: form.productLicenseOfferingId,
            price: parseFloat(form.price) || 0,
            currencyCode: form.currencyCode,
            isActive: form.isActive,
        };

        if (editingId) {
            await update.mutateAsync({ priceId: editingId, payload });
        } else {
            await create.mutateAsync(payload as CreateProductModuleOfferingPriceRequest);
        }
        closeForm();
    };

    const handleDelete = async (priceId: string) => {
        await remove.mutateAsync(priceId);
        setDeleteId(null);
    };

    const usedOfferingIds = new Set(prices.map((p) => p.productLicenseOfferingId));
    const availableOfferings = licenseOfferings.filter(
        (lo) => lo.isActive && (editingId ? true : !usedOfferingIds.has(lo.id))
    );

    if (isLoading) {
        return (
            <div className="text-center py-3 text-soft">
                <div className="spinner-border spinner-border-sm me-2" role="status" />
                Yükleniyor...
            </div>
        );
    }

    return (
        <div className="mt-3">
            <div className="d-flex align-items-center justify-content-between mb-2">
                <span className="overline-title text-soft fs-11">Lisans Paketi Fiyatları</span>
                {!showForm && (
                    <button
                        type="button"
                        className="btn btn-xs btn-outline-primary"
                        onClick={openCreate}
                        disabled={isMutating || availableOfferings.length === 0}
                        title={availableOfferings.length === 0 ? "Tüm paketler için fiyat tanımlandı" : undefined}
                    >
                        <em className="icon ni ni-plus me-1" />
                        Fiyat Ekle
                    </button>
                )}
            </div>

            {showForm && (
                <form onSubmit={handleSubmit} className="card card-bordered bg-light mb-2">
                    <div className="card-inner py-3">
                        <div className="row g-2 align-items-end">
                            <div className="col-md-4">
                                <label className="form-label fs-12 mb-1">Lisans Paketi</label>
                                <select
                                    className="form-select form-select-sm"
                                    value={form.productLicenseOfferingId}
                                    onChange={(e) => setForm((f) => ({ ...f, productLicenseOfferingId: e.target.value }))}
                                    required
                                    disabled={Boolean(editingId)}
                                >
                                    <option value="">Seçiniz...</option>
                                    {(editingId
                                        ? licenseOfferings
                                        : availableOfferings
                                    ).map((lo) => (
                                        <option key={lo.id} value={lo.id}>
                                            {lo.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="col-md-3">
                                <label className="form-label fs-12 mb-1">Fiyat</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    className="form-control form-control-sm"
                                    placeholder="0.00"
                                    value={form.price}
                                    onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                                    required
                                />
                            </div>
                            <div className="col-md-2">
                                <label className="form-label fs-12 mb-1">Para Birimi</label>
                                <input
                                    className="form-control form-control-sm"
                                    placeholder="TRY"
                                    value={form.currencyCode}
                                    onChange={(e) => setForm((f) => ({ ...f, currencyCode: e.target.value }))}
                                    required
                                />
                            </div>
                            <div className="col-md-1 d-flex align-items-end pb-1">
                                <div className="form-check form-switch">
                                    <input
                                        type="checkbox"
                                        className="form-check-input"
                                        id={`ofp-active-${moduleId}`}
                                        checked={form.isActive}
                                        onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))}
                                    />
                                    <label className="form-check-label fs-12" htmlFor={`ofp-active-${moduleId}`}>
                                        Aktif
                                    </label>
                                </div>
                            </div>
                        </div>
                        <div className="row g-2 align-items-center justify-content-end my-1 px-1">
                            <div className="col-md-2 d-flex gap-1 justify-content-end align-items-center mt-4">
                                <button
                                    type="submit"
                                    className="btn btn-sm btn-primary"
                                    disabled={isMutating}
                                >
                                    {isMutating ? (
                                        <span className="spinner-border spinner-border-sm" role="status" />
                                    ) : editingId ? (
                                        "Güncelle"
                                    ) : (
                                        "Kaydet"
                                    )}
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-sm btn-outline-secondary"
                                    onClick={closeForm}
                                    disabled={isMutating}
                                >
                                    İptal
                                </button>
                            </div>
                        </div>
                    </div>
                </form>
            )}

            {prices.length === 0 && !showForm ? (
                <p className="text-soft fs-12 mb-0">Henüz fiyat tanımı yok.</p>
            ) : prices.length > 0 ? (
                <div className="table-responsive">
                    <table className="table table-sm table-middle mb-0">
                        <thead className="table-light">
                            <tr>
                                <th className="fs-12">Lisans Paketi</th>
                                <th className="text-end fs-12">Fiyat</th>
                                <th className="fs-12">Durum</th>
                                <th />
                            </tr>
                        </thead>
                        <tbody>
                            {prices.map((item) => (
                                <tr key={item.id}>
                                    <td className="fs-13px">{item.licenseOfferingName ?? item.productLicenseOfferingId.slice(0, 8)}</td>
                                    <td className="text-end fw-bold fs-13px">
                                        {item.price.toLocaleString("tr-TR", { minimumFractionDigits: 2 })} {item.currencyCode}
                                    </td>
                                    <td>
                                        {item.isActive ? (
                                            <span className="badge bg-success-soft text-success fs-11">Aktif</span>
                                        ) : (
                                            <span className="badge bg-secondary-soft text-secondary fs-11">Pasif</span>
                                        )}
                                    </td>
                                    <td className="text-end">
                                        {deleteId === item.id ? (
                                            <span className="d-flex gap-1 justify-content-end">
                                                <button
                                                    type="button"
                                                    className="btn btn-xs btn-danger"
                                                    onClick={() => handleDelete(item.id)}
                                                    disabled={isMutating}
                                                >
                                                    Sil
                                                </button>
                                                <button
                                                    type="button"
                                                    className="btn btn-xs btn-outline-secondary"
                                                    onClick={() => setDeleteId(null)}
                                                >
                                                    İptal
                                                </button>
                                            </span>
                                        ) : (
                                            <span className="d-flex gap-1 justify-content-end align-items-center">
                                                <button
                                                    type="button"
                                                    className="btn btn-xs btn-outline-info"
                                                    onClick={() => openEdit(item)}
                                                    disabled={showForm}
                                                    title="Düzenle"
                                                >
                                                    <em className="icon ni ni-edit" />
                                                </button>
                                                <button
                                                    type="button"
                                                    className="btn btn-xs btn-outline-danger"
                                                    onClick={() => setDeleteId(item.id)}
                                                    disabled={showForm || isMutating}
                                                    title="Sil"
                                                >
                                                    <em className="icon ni ni-trash" />
                                                </button>
                                            </span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : null}
        </div>
    );
};

export default ModuleOfferingPricesPanel;
