import React from "react";
import { Button } from "reactstrap";
import type { LicenseOfferingForm, ProductUnitForm } from "@/modules/products/types/productEditor.types";
import { formatMoney, getModelMeta } from "./LicenseOfferingFormFields";
import { usePermission } from "@/modules/shared/hooks/usePermission";

interface SalesPlanListPanelProps {
    offerings: LicenseOfferingForm[];
    productUnits: ProductUnitForm[];
    onCreateNew: () => void;
    onEdit: (index: number) => void;
    onDelete: (index: number) => void;
    onOpenRules: (index: number) => void;
}

const resolveUnitLabel = (offering: LicenseOfferingForm, productUnits: ProductUnitForm[]) => {
    const ids = offering.productUnitIds?.length ? offering.productUnitIds : offering.productUnitId ? [offering.productUnitId] : [];
    if (!ids.length) return "Birimsiz paket";

    const names = ids
        .map((id) => productUnits.find((unit) => unit.id === id)?.name)
        .filter((name): name is string => Boolean(name));
    return names.length ? names.join(", ") : "Birimsiz paket";
};

const SalesPlanListPanel: React.FC<SalesPlanListPanelProps> = ({ offerings, productUnits, onCreateNew, onEdit, onDelete, onOpenRules }) => {
    const canEdit = usePermission("product.pricing.edit");

    return (
        <div className="card card-bordered">
            <div className="card-inner border-bottom py-3 d-flex justify-content-between align-items-center">
                <div>
                    <h6 className="title mb-0">Satış Planları</h6>
                    <p className="text-soft fs-12 mb-0">Fiyatlandırma sürecinize buradan yeni bir satış planı oluşturarak başlayın.</p>
                </div>
                {canEdit && (
                    <Button color="primary" size="sm" type="button" onClick={onCreateNew}>
                        <em className="icon ni ni-plus me-1" />
                        Yeni Satış Planı
                    </Button>
                )}
            </div>

            {offerings.length === 0 ? (
                <div className="card-inner text-center py-5 text-soft">
                    <em className="icon ni ni-tag fs-2 d-block mb-2" />
                    <p className="mb-0">Henüz satış planı eklenmedi.</p>
                </div>
            ) : (
                <div className="table-responsive">
                    <table className="table table-middle mb-0">
                        <thead className="table-light">
                            <tr>
                                <th>Plan adı</th>
                                <th>Seçili birim</th>
                                <th>Taban fiyat</th>
                                <th>Durum</th>
                                {canEdit && <th className="text-end">İşlem</th>}
                            </tr>
                        </thead>
                        <tbody>
                            {offerings.map((offering, index) => {
                                const meta = getModelMeta(Number(offering.licenseModel ?? 2));
                                return (
                                    <tr key={offering.id ?? offering._tempId ?? index}>
                                        <td>
                                            <div className="fw-medium">{offering.name || `Plan #${index + 1}`}</div>
                                            <span className={`badge badge-dim bg-${meta.color} fs-11px`}>{meta.label}</span>
                                        </td>
                                        <td className="fs-12px">{resolveUnitLabel(offering, productUnits)}</td>
                                        <td>{formatMoney(offering.basePrice, offering.currencyCode)}</td>
                                        <td>
                                            <span className={`badge bg-${offering.isActive ? "success" : "secondary"}`}>
                                                {offering.isActive ? "Aktif" : "Pasif"}
                                            </span>
                                        </td>
                                        {canEdit && (
                                            <td className="text-end">
                                                <div className="d-inline-flex flex-wrap justify-content-end gap-1">
                                                    <Button color="light" size="sm" type="button" onClick={() => onEdit(index)}>
                                                        <em className="icon ni ni-edit me-1" />
                                                        Düzenle
                                                    </Button>
                                                    {offering.id && (
                                                        <Button color="light" size="sm" type="button" onClick={() => onOpenRules(index)} title="Fiyatlandırma kurallarını yönet">
                                                            <em className="icon ni ni-coins" />
                                                        </Button>
                                                    )}
                                                    <Button color="danger" outline size="sm" type="button" onClick={() => onDelete(index)} title="Planı sil">
                                                        <em className="icon ni ni-trash" />
                                                    </Button>
                                                </div>
                                            </td>
                                        )}
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default SalesPlanListPanel;
