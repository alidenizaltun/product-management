import React from "react";
import { Button } from "reactstrap";
import type { LicenseOfferingForm } from "@/modules/products/types/productEditor.types";
import { formatMoney, getModelMeta } from "./LicenseOfferingFormFields";
import { usePermission } from "@/modules/shared/hooks/usePermission";

interface SalesPlanListPanelProps {
    offerings: LicenseOfferingForm[];
    onCreateNew: () => void;
    onEdit: (index: number) => void;
    onDelete: (index: number) => void;
    onOpenRules: (index: number) => void;
}

const SalesPlanListPanel: React.FC<SalesPlanListPanelProps> = ({ offerings, onCreateNew, onEdit, onDelete, onOpenRules }) => {
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
                <div className="card-inner">
                    <div className="row g-3">
                        {offerings.map((offering, index) => {
                            const meta = getModelMeta(Number(offering.licenseModel ?? 2));
                            return (
                                <div className="col-sm-4 col-xl-3" key={offering.id ?? offering._tempId ?? index}>
                                    <div className="card card-bordered h-100">
                                        <div className="card-inner d-flex flex-column h-100">
                                            <div className="d-flex justify-content-between align-items-start mb-2">
                                                <span className={`badge badge-dim bg-${meta.color} fs-11px`}>{meta.label}</span>
                                                <span className={`badge bg-${offering.isActive ? "success" : "secondary"}`}>
                                                    {offering.isActive ? "Aktif" : "Pasif"}
                                                </span>
                                            </div>
                                            <h6 className="title mb-1">{offering.name || `Plan #${index + 1}`}</h6>
                                            {canEdit && (
                                                <div className="d-flex flex-wrap gap-1 mt-auto pt-2">
                                                    <Button color="light" size="sm" type="button" onClick={() => onEdit(index)}>
                                                        <em className="icon ni ni-setting me-1" />
                                                        Ayarlar
                                                    </Button>
                                                    {offering.id && (
                                                        <Button color="light" size="sm" type="button" onClick={() => onOpenRules(index)} title="Fiyatlandırma kurallarını yönet">
                                                            <em className="icon ni ni-coins me-1" />
                                                            Fiyatlandırma
                                                        </Button>
                                                    )}
                                                    <Button color="danger" outline size="sm" type="button" className="ms-auto" onClick={() => onDelete(index)} title="Planı sil">
                                                        <em className="icon ni ni-trash" />
                                                    </Button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
};

export default SalesPlanListPanel;
