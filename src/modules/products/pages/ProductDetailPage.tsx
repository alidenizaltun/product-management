import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "reactstrap";
import Content from "@/layout/content/Content";
import Head from "@/layout/head/Head";
import { Block } from "@/components/Component";
import PageHeader from "@/modules/shared/components/PageHeader";
import StatusBadge from "@/modules/shared/components/StatusBadge";
import ConfirmDialog from "@/modules/shared/components/ConfirmDialog";
import AppTabs, { TabItem } from "@/modules/shared/components/AppTabs";
import { useProductDetail } from "@/modules/products/hooks/useProductDetail";
import { useProductMutations } from "@/modules/products/hooks/useProductMutations";
import type {
    ProductDetailDto,
    ProductAttributeValueDto,
    ProductVariantDto,
    ProductPriceDto,
    ProductInventoryDetailDto,
    ProductMediaItemDto,
    ProductCategoryMapDetailDto,
    ProductBundleItemDto,
    ProductSupplierMapDto,
    ProductModuleDto,
    SoftwarePricingTierDto,
    ProductLicenseOfferingDto,
} from "@/shared/types/productOperations.types";

// ─── Constants ────────────────────────────────────────────────────────────────

const KIND_LABELS: Record<number, { label: string; color: string; icon: string }> = {
    1: { label: "Fiziksel", color: "primary", icon: "box" },
    2: { label: "Yazılım", color: "info", icon: "laptop" },
    3: { label: "Hizmet", color: "success", icon: "briefcase" },
    4: { label: "Abonelik", color: "warning", icon: "repeat" },
};

const STATUS_LABELS: Record<number, { label: string; color: string }> = {
    0: { label: "Taslak", color: "secondary" },
    1: { label: "Aktif", color: "success" },
    2: { label: "Pasif", color: "warning" },
    3: { label: "Arşivlendi", color: "danger" },
};

const PRICE_TYPE_LABELS: Record<number, { label: string; color: string }> = {
    1: { label: "Satış", color: "primary" },
    2: { label: "Kurumsal", color: "info" },
    3: { label: "Toptan", color: "warning" },
    4: { label: "Özel", color: "success" },
};

const LICENSE_MODEL_LABELS: Record<number, { label: string; color: string }> = {
    1: { label: "Tek Seferlik", color: "primary" },
    2: { label: "Abonelik", color: "info" },
    3: { label: "Kullanım Bazlı", color: "warning" },
    4: { label: "Koltuk Bazlı", color: "success" },
    5: { label: "Deneme", color: "secondary" },
};

const BILLING_UNIT_LABELS: Record<number, string> = {
    1: "Gün",
    2: "Hafta",
    3: "Ay",
    4: "Yıl",
};

const INVENTORY_POLICY_LABELS: Record<number, string> = {
    0: "İzin Ver",
    1: "Reddet",
    2: "Beklet",
};

// ─── Shared UI Helpers ────────────────────────────────────────────────────────

const SectionCard: React.FC<{
    title: string;
    subtitle?: string;
    icon?: string;
    children: React.ReactNode;
    actions?: React.ReactNode;
    fullHeight?: boolean;
}> = ({ title, subtitle, icon, children, actions, fullHeight = true }) => (
    <div className={`card card-bordered${fullHeight ? " h-100" : ""}`} style={{ overflow: "hidden" }}>
        <div className="card-inner" style={{ overflow: "hidden" }}>
            <div className="d-flex align-items-start justify-content-between mb-3">
                <div className="d-flex align-items-center gap-2 min-w-0">
                    {icon && <em className={`icon ni ni-${icon} fs-4 text-primary flex-shrink-0`} />}
                    <div className="min-w-0">
                        <h6 className="title mb-0 text-truncate">{title}</h6>
                        {subtitle && <p className="text-soft fs-12 mb-0 text-truncate">{subtitle}</p>}
                    </div>
                </div>
                {actions}
            </div>
            {children}
        </div>
    </div>
);

const EmptyState: React.FC<{ icon?: string; text: string }> = ({ icon = "inbox", text }) => (
    <div className="text-center py-4">
        <em className={`icon ni ni-${icon} fs-1 text-soft d-block mb-2`} />
        <p className="text-soft mb-0 fs-13px">{text}</p>
    </div>
);

const fmt = (n?: number | null, currency?: string) =>
    n != null
        ? n.toLocaleString("tr-TR", currency ? { minimumFractionDigits: 2, maximumFractionDigits: 2 } : undefined) +
        (currency ? ` ${currency}` : "")
        : "—";

const fmtDate = (d?: string | null) =>
    d ? new Date(d).toLocaleDateString("tr-TR") : "—";

const fmtDateTime = (d?: string | null) =>
    d ? new Date(d).toLocaleString("tr-TR") : "—";

// ─── General Tab ─────────────────────────────────────────────────────────────

const GeneralTab: React.FC<{ product: ProductDetailDto }> = ({ product }) => {
    const kind = KIND_LABELS[product.kind];
    const status = STATUS_LABELS[product.status];
    const primaryImage = product.mediaItems?.find((m) => m.isPrimary) ?? product.mediaItems?.[0];

    return (
        <div className="row g-4">
            {/* Sol: Görsel + Durum */}
            <div className="col-lg-4">
                <div className="card card-bordered mb-3" style={{ overflow: "hidden" }}>
                    <div className="card-inner text-center py-4" style={{ overflow: "hidden" }}>
                        {primaryImage?.url ? (
                            <img
                                src={primaryImage.thumbnailUrl ?? primaryImage.url}
                                alt={primaryImage.altText ?? product.name}
                                className="rounded"
                                style={{ maxHeight: 220, maxWidth: "100%", objectFit: "contain", display: "block", margin: "0 auto" }}
                            />
                        ) : (
                            <div
                                className="d-flex flex-column align-items-center justify-content-center text-soft rounded bg-light"
                                style={{ height: 180 }}
                            >
                                <em className="icon ni ni-img fs-1 mb-2" />
                                <span className="fs-12">Görsel Yok</span>
                            </div>
                        )}
                    </div>
                </div>

                <div className="card card-bordered">
                    <div className="card-inner">
                        <div className="d-flex flex-column gap-2">
                            <div className="d-flex justify-content-between align-items-center">
                                <span className="text-soft fs-12">Tür</span>
                                {kind ? (
                                    <span className={`badge bg-${kind.color}`}>
                                        <em className={`icon ni ni-${kind.icon} me-1`} />
                                        {kind.label}
                                    </span>
                                ) : (
                                    <span className="text-muted">—</span>
                                )}
                            </div>
                            <div className="d-flex justify-content-between align-items-center">
                                <span className="text-soft fs-12">Durum</span>
                                {status ? (
                                    <span className={`badge badge-dim bg-${status.color}`}>{status.label}</span>
                                ) : (
                                    <span className="text-muted">—</span>
                                )}
                            </div>
                            <div className="d-flex justify-content-between align-items-center">
                                <span className="text-soft fs-12">Aktif</span>
                                <StatusBadge active={product.isActive} />
                            </div>
                            <div className="d-flex justify-content-between align-items-center">
                                <span className="text-soft fs-12">Satılabilir</span>
                                <StatusBadge active={product.isSellable} />
                            </div>
                            <div className="d-flex justify-content-between align-items-center">
                                <span className="text-soft fs-12">Satın Alınabilir</span>
                                <StatusBadge active={product.isPurchasable} />
                            </div>
                            <div className="d-flex justify-content-between align-items-center">
                                <span className="text-soft fs-12">Stok Takibi</span>
                                <StatusBadge active={product.trackInventory} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Sağ: Detaylar */}
            <div className="col-lg-8">
                <div className="card card-bordered mb-3" style={{ overflow: "hidden" }}>
                    <div className="card-inner" style={{ overflow: "hidden" }}>
                        <h5 className="fw-bold mb-1" style={{ wordBreak: "break-word" }}>{product.name}</h5>
                        <p className="text-primary fs-13px mb-2" style={{ wordBreak: "break-word" }}>
                            <em className="icon ni ni-tag me-1" />
                            {product.productCode}
                        </p>
                        {product.shortDescription && (
                            <p className="text-soft mb-0" style={{ wordBreak: "break-word" }}>{product.shortDescription}</p>
                        )}
                    </div>
                </div>

                <div className="row g-3">
                    <div className="col-md-6">
                        <SectionCard title="Ürün Bilgileri" icon="package" fullHeight={false}>
                            <div className="d-flex flex-column gap-2">
                                {[
                                    { label: "Marka", value: product.brand },
                                    { label: "Üretici", value: product.manufacturer },
                                    { label: "Barkod", value: product.barcode ? <code>{product.barcode}</code> : undefined },
                                    { label: "Para Birimi", value: product.defaultCurrencyCode },
                                    { label: "Ölçü Birimi", value: product.unitDefinitionName },
                                ].map(({ label, value }) => (
                                    <div key={label} className="d-flex justify-content-between align-items-center border-bottom pb-2">
                                        <span className="text-soft fs-12">{label}</span>
                                        <span className="fw-medium fs-13px">{value ?? <span className="text-muted">—</span>}</span>
                                    </div>
                                ))}
                            </div>
                        </SectionCard>
                    </div>
                    <div className="col-md-6">
                        <SectionCard title="Vergi & Fiyatlandırma" icon="money" fullHeight={false}>
                            <div className="d-flex flex-column gap-2">
                                {[
                                    {
                                        label: "Vergi Oranı",
                                        value:
                                            product.taxRate != null ? (
                                                <span className="badge bg-outline-info">%{product.taxRate}</span>
                                            ) : undefined,
                                    },
                                    { label: "Vergi Kodu", value: product.taxCode },
                                ].map(({ label, value }) => (
                                    <div key={label} className="d-flex justify-content-between align-items-center border-bottom pb-2">
                                        <span className="text-soft fs-12">{label}</span>
                                        <span className="fw-medium fs-13px">{value ?? <span className="text-muted">—</span>}</span>
                                    </div>
                                ))}
                                <div className="d-flex justify-content-between align-items-center pt-1">
                                    <span className="text-soft fs-12">Toplam Fiyat Tanımı</span>
                                    <span className="badge bg-primary">{product.prices.length}</span>
                                </div>
                                <div className="d-flex justify-content-between align-items-center">
                                    <span className="text-soft fs-12">Toplam Stok Kaydı</span>
                                    <span className="badge bg-success">{product.inventories.length}</span>
                                </div>
                            </div>
                        </SectionCard>
                    </div>
                </div>

                {product.tags && (
                    <div className="card card-bordered mt-3" style={{ overflow: "hidden" }}>
                        <div className="card-inner py-3 d-flex flex-wrap align-items-center" style={{ overflow: "hidden" }}>
                            <span className="text-soft fs-12 me-2">Etiketler:</span>
                            {product.tags.split(",").map((tag) => (
                                <span key={tag.trim()} className="badge bg-outline-primary me-1 mb-1">
                                    {tag.trim()}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {product.description && (
                    <div className="card card-bordered mt-3" style={{ overflow: "hidden" }}>
                        <div className="card-inner" style={{ overflow: "hidden" }}>
                            <h6 className="overline-title text-soft mb-2">Açıklama</h6>
                            <p className="text-base mb-0" style={{ whiteSpace: "pre-wrap", lineHeight: 1.7, wordBreak: "break-word" }}>
                                {product.description}
                            </p>
                        </div>
                    </div>
                )}

                <div className="card card-bordered mt-3" style={{ overflow: "hidden" }}>
                    <div className="card-inner py-2" style={{ overflow: "hidden" }}>
                        <div className="d-flex gap-4 flex-wrap">
                            <div>
                                <span className="text-soft fs-11 d-block">Oluşturulma</span>
                                <span className="fs-12 fw-medium">{fmtDateTime(product.createdAt)}</span>
                            </div>
                            <div>
                                <span className="text-soft fs-11 d-block">Son Güncelleme</span>
                                <span className="fs-12 fw-medium">{fmtDateTime(product.updatedAt)}</span>
                            </div>
                            <div className="min-w-0" style={{ maxWidth: "100%" }}>
                                <span className="text-soft fs-11 d-block">ID</span>
                                <code className="fs-11 d-block text-truncate">{product.id}</code>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// ─── Attributes Tab ───────────────────────────────────────────────────────────

const AttributesTab: React.FC<{ items: ProductAttributeValueDto[] }> = ({ items }) => {
    if (!items.length) return <EmptyState icon="list" text="Bu ürüne atanmış özellik değeri yok." />;
    return (
        <div className="row g-3">
            {items.map((it) => (
                <div key={it.id} className="col-md-6 col-lg-4">
                    <div className="card card-bordered h-100" style={{ overflow: "hidden" }}>
                        <div className="card-inner py-3" style={{ overflow: "hidden" }}>
                            <p className="text-soft fs-11 mb-1">Özellik ID</p>
                            <code className="fs-12 text-primary text-truncate d-block">{it.attributeDefinitionId.slice(0, 8)}…</code>
                            <div className="mt-2 d-flex flex-column gap-1">
                                {it.valueText && (
                                    <div className="d-flex justify-content-between">
                                        <span className="text-soft fs-12">Metin</span>
                                        <span className="fw-medium fs-12">{it.valueText}</span>
                                    </div>
                                )}
                                {it.valueNumber != null && (
                                    <div className="d-flex justify-content-between">
                                        <span className="text-soft fs-12">Sayı</span>
                                        <span className="fw-medium fs-12">{it.valueNumber}</span>
                                    </div>
                                )}
                                {it.valueBool != null && (
                                    <div className="d-flex justify-content-between">
                                        <span className="text-soft fs-12">Boolean</span>
                                        <StatusBadge active={it.valueBool} />
                                    </div>
                                )}
                                {it.valueDate && (
                                    <div className="d-flex justify-content-between">
                                        <span className="text-soft fs-12">Tarih</span>
                                        <span className="fw-medium fs-12">{fmtDate(it.valueDate)}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

// ─── Variants Tab ─────────────────────────────────────────────────────────────

const VariantsTab: React.FC<{ items: ProductVariantDto[] }> = ({ items }) => {
    if (!items.length) return <EmptyState icon="layers" text="Bu ürüne ait varyant yok." />;
    return (
        <div className="row g-3">
            {items.map((v) => (
                <div key={v.id} className="col-md-6 col-lg-4">
                    <div className="card card-bordered" style={{ overflow: "hidden" }}>
                        <div className="card-inner" style={{ overflow: "hidden" }}>
                            <div className="d-flex justify-content-between align-items-start mb-2">
                                <div className="min-w-0 me-2">
                                    <span className="fw-bold fs-14px d-block text-truncate">{v.name}</span>
                                    <code className="fs-11 text-primary text-truncate d-block">{v.sku}</code>
                                </div>
                                <StatusBadge active={v.isActive} />
                            </div>
                            <div className="d-flex flex-column gap-1">
                                {v.barcode && (
                                    <div className="d-flex justify-content-between">
                                        <span className="text-soft fs-12">Barkod</span>
                                        <code className="fs-12">{v.barcode}</code>
                                    </div>
                                )}
                                {v.additionalPrice != null && (
                                    <div className="d-flex justify-content-between">
                                        <span className="text-soft fs-12">Ek Fiyat</span>
                                        <span className="text-success fw-medium fs-12">+{fmt(v.additionalPrice)}</span>
                                    </div>
                                )}
                                {v.additionalCost != null && (
                                    <div className="d-flex justify-content-between">
                                        <span className="text-soft fs-12">Ek Maliyet</span>
                                        <span className="text-warning fw-medium fs-12">+{fmt(v.additionalCost)}</span>
                                    </div>
                                )}
                                {v.optionValuesJson && (
                                    <div className="mt-1 pt-1 border-top" style={{ overflow: "hidden" }}>
                                        <span className="text-soft fs-11">Seçenekler</span>
                                        <p className="mb-0 fs-11 text-soft" style={{ wordBreak: "break-all", overflowWrap: "break-word" }}>{v.optionValuesJson}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

// ─── Prices Tab ───────────────────────────────────────────────────────────────

const PricesTab: React.FC<{ items: ProductPriceDto[]; currencyCode: string }> = ({ items }) => {
    if (!items.length) return <EmptyState icon="sign-turkish-lira" text="Bu ürüne ait fiyat tanımı yok." />;
    return (
        <div className="row g-3">
            {items.map((p) => {
                const pt = PRICE_TYPE_LABELS[p.priceType];
                return (
                    <div key={p.id} className="col-md-6 col-xl-4">
                        <div className="card card-bordered h-100" style={{ overflow: "hidden" }}>
                            <div className="card-inner" style={{ overflow: "hidden" }}>
                                <div className="d-flex justify-content-between align-items-center mb-3">
                                    <span className={`badge bg-${pt?.color ?? "secondary"}`}>{pt?.label ?? p.priceType}</span>
                                    <span className="text-soft fs-11">{p.currencyCode}</span>
                                </div>
                                <div className="text-center mb-3" style={{ overflow: "hidden" }}>
                                    <span className="fs-1 fw-bold text-dark">{fmt(p.amount)}</span>
                                    {p.compareAtAmount != null && (
                                        <span className="text-soft text-decoration-line-through ms-2 fs-14px">
                                            {fmt(p.compareAtAmount)}
                                        </span>
                                    )}
                                    {p.compareAtAmount != null && p.compareAtAmount > 0 && p.amount != null && (
                                        <div>
                                            <span className="badge bg-danger-soft text-danger fs-11">
                                                %{Math.round(((p.compareAtAmount - p.amount) / p.compareAtAmount) * 100)} indirim
                                            </span>
                                        </div>
                                    )}
                                </div>
                                <div className="d-flex flex-column gap-1 fs-12">
                                    {(p.minQuantity != null || p.maxQuantity != null) && (
                                        <div className="d-flex justify-content-between">
                                            <span className="text-soft">Miktar Aralığı</span>
                                            <span>
                                                {p.minQuantity ?? "—"} – {p.maxQuantity ?? "∞"}
                                            </span>
                                        </div>
                                    )}
                                    {p.salesChannel && (
                                        <div className="d-flex justify-content-between">
                                            <span className="text-soft">Satış Kanalı</span>
                                            <span className="badge bg-outline-info">{p.salesChannel}</span>
                                        </div>
                                    )}
                                    {p.customerGroupCode && (
                                        <div className="d-flex justify-content-between">
                                            <span className="text-soft">Müşteri Grubu</span>
                                            <span className="badge bg-outline-warning">{p.customerGroupCode}</span>
                                        </div>
                                    )}
                                    {(p.validFrom || p.validTo) && (
                                        <div className="border-top pt-1 mt-1">
                                            <span className="text-soft d-block">Geçerlilik</span>
                                            <span className="text-soft fs-11">
                                                {fmtDate(p.validFrom)} – {fmtDate(p.validTo)}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

// ─── Inventory Tab ────────────────────────────────────────────────────────────

const InventoryTab: React.FC<{ items: ProductInventoryDetailDto[] }> = ({ items }) => {
    if (!items.length) return <EmptyState icon="package" text="Stok kaydı bulunamadı." />;

    const totalOnHand = items.reduce((s, i) => s + i.quantityOnHand, 0);
    const totalReserved = items.reduce((s, i) => s + i.quantityReserved, 0);
    const totalAvailable = items.reduce((s, i) => s + i.quantityAvailable, 0);

    return (
        <div>
            <div className="row g-3 mb-4">
                {[
                    { label: "Toplam Eldeki", value: totalOnHand, color: "primary", icon: "box" },
                    { label: "Toplam Rezerve", value: totalReserved, color: "warning", icon: "lock" },
                    {
                        label: "Toplam Mevcut",
                        value: totalAvailable,
                        color: totalAvailable <= 0 ? "danger" : "success",
                        icon: "check-circle",
                    },
                ].map(({ label, value, color, icon }) => (
                    <div key={label} className="col-sm-4">
                        <div className={`card card-bordered border-${color}`}>
                            <div className="card-inner py-3 text-center">
                                <em className={`icon ni ni-${icon} fs-2 text-${color} d-block mb-1`} />
                                <div className={`fs-2 fw-bold text-${color}`}>{value}</div>
                                <div className="text-soft fs-12">{label}</div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="row g-3">
                {items.map((inv) => {
                    const isEmpty = inv.quantityAvailable <= 0;
                    const isLow =
                        inv.reorderPoint != null && inv.quantityAvailable <= inv.reorderPoint && !isEmpty;
                    const statusColor = isEmpty ? "danger" : isLow ? "warning" : "success";
                    const statusLabel = isEmpty ? "Stoksuz" : isLow ? "Düşük Stok" : "Normal";

                    return (
                        <div key={inv.id} className="col-md-6 col-xl-4">
                            <div className={`card card-bordered border-${statusColor} h-100`} style={{ overflow: "hidden" }}>
                                <div className="card-inner" style={{ overflow: "hidden" }}>
                                    <div className="d-flex justify-content-between align-items-center mb-3">
                                        <span className="fw-bold fs-14px text-truncate me-2">
                                            <em className="icon ni ni-building me-1 text-soft" />
                                            {inv.warehouseCode ?? inv.warehouseId.slice(0, 8) + "…"}
                                        </span>
                                        <span className={`badge bg-${statusColor} flex-shrink-0`}>{statusLabel}</span>
                                    </div>
                                    <div className="row g-2 text-center">
                                        <div className="col-4">
                                            <div className="fs-4 fw-bold text-primary">{inv.quantityOnHand}</div>
                                            <div className="text-soft fs-11">Eldeki</div>
                                        </div>
                                        <div className="col-4">
                                            <div className="fs-4 fw-bold text-warning">{inv.quantityReserved}</div>
                                            <div className="text-soft fs-11">Rezerve</div>
                                        </div>
                                        <div className="col-4">
                                            <div className={`fs-4 fw-bold text-${statusColor}`}>{inv.quantityAvailable}</div>
                                            <div className="text-soft fs-11">Mevcut</div>
                                        </div>
                                    </div>
                                    {(inv.reorderPoint != null || inv.reorderQuantity != null) && (
                                        <div className="border-top pt-2 mt-2 d-flex justify-content-between fs-12">
                                            <span className="text-soft">Sipariş Noktası / Miktarı</span>
                                            <span>
                                                {inv.reorderPoint ?? "—"} / {inv.reorderQuantity ?? "—"}
                                            </span>
                                        </div>
                                    )}
                                    {inv.inventoryPolicy != null && (
                                        <div className="d-flex justify-content-between fs-12 mt-1">
                                            <span className="text-soft">Stok Politikası</span>
                                            <span>{INVENTORY_POLICY_LABELS[inv.inventoryPolicy] ?? inv.inventoryPolicy}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

// ─── Media Tab ────────────────────────────────────────────────────────────────

const MediaTab: React.FC<{ items: ProductMediaItemDto[] }> = ({ items }) => {
    if (!items.length) return <EmptyState icon="img" text="Medya dosyası bulunamadı." />;
    return (
        <div className="row g-3">
            {items.map((m) => (
                <div key={m.id} className="col-6 col-md-4 col-lg-3">
                    <div className={`card card-bordered h-100 ${m.isPrimary ? "border-primary" : ""}`} style={{ overflow: "hidden" }}>
                        {m.isPrimary && (
                            <div className="card-header py-1 bg-primary text-white text-center fs-11">
                                <em className="icon ni ni-star me-1" />
                                Ana Görsel
                            </div>
                        )}
                        <div className="card-inner p-2 text-center d-flex flex-column" style={{ overflow: "hidden" }}>
                            <div className="flex-grow-1 d-flex align-items-center justify-content-center mb-2" style={{ overflow: "hidden", maxWidth: "100%" }}>
                                {m.thumbnailUrl || m.url ? (
                                    <a href={m.url} target="_blank" rel="noreferrer" style={{ display: "block", maxWidth: "100%", overflow: "hidden" }}>
                                        <img
                                            src={m.thumbnailUrl ?? m.url}
                                            alt={m.altText ?? "Ürün görseli"}
                                            className="rounded"
                                            style={{ maxHeight: 150, maxWidth: "100%", objectFit: "contain", display: "block" }}
                                        />
                                    </a>
                                ) : (
                                    <div
                                        className="d-flex align-items-center justify-content-center bg-light rounded w-100"
                                        style={{ height: 120 }}
                                    >
                                        <em className="icon ni ni-img fs-2 text-soft" />
                                    </div>
                                )}
                            </div>
                            <div className="d-flex flex-column gap-1" style={{ overflow: "hidden" }}>
                                {m.altText && <p className="text-soft mb-0 fs-11 text-truncate">{m.altText}</p>}
                                {m.mimeType && <span className="badge bg-outline-secondary fs-10 text-truncate">{m.mimeType}</span>}
                                <span className="text-soft fs-11">Sıra: {m.sortOrder ?? "—"}</span>
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

// ─── Categories Tab ───────────────────────────────────────────────────────────

const CategoriesTab: React.FC<{ items: ProductCategoryMapDetailDto[] }> = ({ items }) => {
    if (!items.length) return <EmptyState icon="folder" text="Kategori ataması yok." />;
    return (
        <div className="row g-3">
            {items.map((c) => (
                <div key={c.id} className="col-md-6 col-lg-4">
                    <div className={`card card-bordered h-100 ${c.isPrimary ? "border-primary" : ""}`} style={{ overflow: "hidden" }}>
                        <div className="card-inner py-3" style={{ overflow: "hidden" }}>
                            <div className="d-flex justify-content-between align-items-center mb-2">
                                {c.isPrimary ? (
                                    <span className="badge bg-primary">
                                        <em className="icon ni ni-star-fill me-1" />
                                        Ana Kategori
                                    </span>
                                ) : (
                                    <span className="badge bg-outline-secondary">İkincil</span>
                                )}
                                <span className="text-soft fs-11">Sıra: {c.sortOrder ?? "—"}</span>
                            </div>
                            <code className="fs-12 text-primary d-block text-truncate">{c.productCategoryId.slice(0, 8)}…</code>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

// ─── Bundles Tab ──────────────────────────────────────────────────────────────

const BundlesTab: React.FC<{ items: ProductBundleItemDto[] }> = ({ items }) => {
    if (!items.length) return <EmptyState icon="grid-sq" text="Bundle ürünü eklenmemiş." />;
    return (
        <div className="row g-3">
            {items.map((bi) => (
                <div key={bi.id} className="col-md-6 col-lg-4">
                    <div className="card card-bordered h-100" style={{ overflow: "hidden" }}>
                        <div className="card-inner py-3" style={{ overflow: "hidden" }}>
                            <div className="d-flex justify-content-between align-items-center mb-2">
                                <span className="badge bg-info">Bundle Ürün</span>
                                {bi.isOptional && <span className="badge bg-outline-warning">Opsiyonel</span>}
                            </div>
                            <code className="fs-12 text-primary d-block mb-2 text-truncate">{bi.childProductId.slice(0, 8)}…</code>
                            <div className="d-flex justify-content-between align-items-center fs-12">
                                <span className="text-soft">Miktar</span>
                                <span className="badge bg-primary fs-13px">{bi.quantity}</span>
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

// ─── Suppliers Tab ────────────────────────────────────────────────────────────

const SuppliersTab: React.FC<{ items: ProductSupplierMapDto[] }> = ({ items }) => {
    if (!items.length) return <EmptyState icon="truck" text="Tedarikçi ataması yok." />;
    return (
        <div className="row g-3">
            {items.map((s) => (
                <div key={s.id} className="col-md-6 col-lg-4">
                    <div className={`card card-bordered h-100 ${s.isPreferred ? "border-success" : ""}`} style={{ overflow: "hidden" }}>
                        <div className="card-inner" style={{ overflow: "hidden" }}>
                            <div className="d-flex justify-content-between align-items-center mb-3">
                                <code className="fs-12 text-primary text-truncate me-2" style={{ maxWidth: "60%" }}>{s.productSupplierId.slice(0, 8)}…</code>
                                {s.isPreferred && (
                                    <span className="badge bg-success flex-shrink-0">
                                        <em className="icon ni ni-star-fill me-1" />
                                        Tercih
                                    </span>
                                )}
                            </div>
                            <div className="d-flex flex-column gap-2 fs-12">
                                {s.supplierProductCode && (
                                    <div className="d-flex justify-content-between align-items-center">
                                        <span className="text-soft flex-shrink-0 me-2">Tedarikçi Ürün Kodu</span>
                                        <code className="text-truncate" style={{ maxWidth: "50%" }}>{s.supplierProductCode}</code>
                                    </div>
                                )}
                                {s.supplierCost != null && (
                                    <div className="d-flex justify-content-between">
                                        <span className="text-soft">Maliyet</span>
                                        <span className="fw-medium text-warning">{fmt(s.supplierCost)}</span>
                                    </div>
                                )}
                                {s.leadTimeInDays != null && (
                                    <div className="d-flex justify-content-between">
                                        <span className="text-soft">Teslimat Süresi</span>
                                        <span>{s.leadTimeInDays} gün</span>
                                    </div>
                                )}
                                {s.minOrderQuantity != null && (
                                    <div className="d-flex justify-content-between">
                                        <span className="text-soft">Min. Sipariş</span>
                                        <span>{s.minOrderQuantity} adet</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

// ─── Profile Tab ──────────────────────────────────────────────────────────────

const ProfileTab: React.FC<{ product: ProductDetailDto }> = ({ product }) => {
    const { kind, physicalProfile: phys, softwareProfile: sw, serviceProfile: svc, subscriptionProfile: sub } = product;

    if (kind === 1 && phys) {
        return (
            <div className="row g-3">
                <div className="col-md-6">
                    <SectionCard title="Boyutlar & Ağırlık" icon="package">
                        <div className="row g-3 text-center">
                            {[
                                { label: "Ağırlık", value: phys.weight, unit: "kg" },
                                { label: "Genişlik", value: phys.width, unit: "cm" },
                                { label: "Yükseklik", value: phys.height, unit: "cm" },
                                { label: "Uzunluk", value: phys.length, unit: "cm" },
                            ].map(({ label, value, unit }) => (
                                <div key={label} className="col-6">
                                    <div className="card bg-light border-0">
                                        <div className="card-inner py-3">
                                            <div className="fs-3 fw-bold text-primary">{value ?? "—"}</div>
                                            <div className="text-soft fs-11">
                                                {label} {value != null ? `(${unit})` : ""}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </SectionCard>
                </div>
                <div className="col-md-6">
                    <SectionCard title="Kargo & Özellikler" icon="truck">
                        <div className="d-flex flex-column gap-2">
                            {[
                                { label: "Kargoya Verilir", value: phys.requiresShipping },
                                { label: "Kırılgan", value: phys.isFragile },
                                { label: "Tehlikeli Madde", value: phys.isHazardous },
                                { label: "Seri No Gerekli", value: phys.requiresSerialNumber },
                            ].map(({ label, value }) => (
                                <div key={label} className="d-flex justify-content-between align-items-center border-bottom pb-2">
                                    <span className="text-soft fs-12">{label}</span>
                                    <StatusBadge active={value} />
                                </div>
                            ))}
                            <div className="d-flex justify-content-between align-items-center">
                                <span className="text-soft fs-12">Garanti Süresi</span>
                                <span className="fw-medium">
                                    {phys.warrantyInMonths != null ? `${phys.warrantyInMonths} ay` : "—"}
                                </span>
                            </div>
                        </div>
                    </SectionCard>
                </div>
            </div>
        );
    }

    if (kind === 2 && sw) {
        return (
            <div className="row g-3">
                <div className="col-md-6">
                    <SectionCard title="Yazılım Bilgileri" icon="laptop">
                        <div className="d-flex flex-column gap-2">
                            {[
                                {
                                    label: "Versiyon",
                                    value: sw.version ? <span className="badge bg-outline-info">{sw.version}</span> : null,
                                },
                                {
                                    label: "İndirme URL",
                                    value: sw.downloadUrl ? (
                                        <a href={sw.downloadUrl} target="_blank" rel="noreferrer" className="text-primary fs-12 text-truncate d-inline-block" style={{ maxWidth: 180, verticalAlign: "bottom" }}>
                                            {sw.downloadUrl}
                                        </a>
                                    ) : null,
                                },
                            ].map(({ label, value }) => (
                                <div key={label} className="d-flex justify-content-between align-items-center border-bottom pb-2">
                                    <span className="text-soft fs-12">{label}</span>
                                    {value ?? <span className="text-muted">—</span>}
                                </div>
                            ))}
                        </div>
                    </SectionCard>
                </div>
                {(sw.supportedPlatformsJson || sw.systemRequirementsJson || sw.releaseNotes) && (
                    <div className="col-md-6">
                        <SectionCard title="Teknik Detaylar" icon="code">
                            <div className="d-flex flex-column gap-3" style={{ overflow: "hidden" }}>
                                {sw.releaseNotes && (
                                    <div style={{ overflow: "hidden" }}>
                                        <p className="text-soft fs-11 mb-1">Sürüm Notları</p>
                                        <p className="mb-0 fs-13px" style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
                                            {sw.releaseNotes}
                                        </p>
                                    </div>
                                )}
                                {sw.supportedPlatformsJson && (
                                    <div style={{ overflow: "hidden" }}>
                                        <p className="text-soft fs-11 mb-1">Desteklenen Platformlar</p>
                                        <code className="fs-11 d-block" style={{ wordBreak: "break-all", overflowWrap: "break-word" }}>{sw.supportedPlatformsJson}</code>
                                    </div>
                                )}
                                {sw.systemRequirementsJson && (
                                    <div style={{ overflow: "hidden" }}>
                                        <p className="text-soft fs-11 mb-1">Sistem Gereksinimleri</p>
                                        <code className="fs-11 d-block" style={{ wordBreak: "break-all", overflowWrap: "break-word" }}>{sw.systemRequirementsJson}</code>
                                    </div>
                                )}
                            </div>
                        </SectionCard>
                    </div>
                )}
            </div>
        );
    }

    if (kind === 3 && svc) {
        return (
            <div className="row g-3">
                <div className="col-md-6">
                    <SectionCard title="Hizmet Profili" icon="briefcase">
                        <div className="row g-3 text-center">
                            {[
                                { label: "Süre", value: svc.durationInMinutes, unit: "dk" },
                                { label: "Maks. Eş Zamanlı", value: svc.maxConcurrentBooking, unit: "kişi" },
                            ].map(({ label, value, unit }) => (
                                <div key={label} className="col-6">
                                    <div className="card bg-light border-0">
                                        <div className="card-inner py-3">
                                            <div className="fs-2 fw-bold text-success">{value ?? "—"}</div>
                                            <div className="text-soft fs-11">
                                                {label} {value != null ? `(${unit})` : ""}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        {svc.serviceAreaJson && (
                            <div className="mt-3">
                                <p className="text-soft fs-11 mb-1">Hizmet Bölgesi</p>
                                <code className="fs-11">{svc.serviceAreaJson}</code>
                            </div>
                        )}
                    </SectionCard>
                </div>
            </div>
        );
    }

    if (kind === 4 && sub) {
        return (
            <div className="row g-3">
                <div className="col-md-6">
                    <SectionCard title="Abonelik Profili" icon="repeat">
                        <div className="d-flex flex-column gap-2">
                            {[
                                {
                                    label: "Faturalama Periyodu",
                                    value:
                                        sub.billingPeriodValue && sub.billingPeriodUnit
                                            ? `${sub.billingPeriodValue} ${BILLING_UNIT_LABELS[sub.billingPeriodUnit] ?? ""}`
                                            : null,
                                },
                                { label: "Deneme Süresi", value: sub.trialDays != null ? `${sub.trialDays} gün` : null },
                                { label: "İzin Süresi", value: sub.gracePeriodDays != null ? `${sub.gracePeriodDays} gün` : null },
                                { label: "Otomatik Yenileme", value: <StatusBadge active={sub.autoRenew} /> },
                                { label: "İptal Politikası", value: sub.cancellationPolicy },
                            ].map(({ label, value }) => (
                                <div key={label} className="d-flex justify-content-between align-items-center border-bottom pb-2">
                                    <span className="text-soft fs-12">{label}</span>
                                    <span className="fw-medium">{value ?? <span className="text-muted">—</span>}</span>
                                </div>
                            ))}
                        </div>
                    </SectionCard>
                </div>
            </div>
        );
    }

    return <EmptyState icon="info" text="Bu ürün türü için profil bilgisi yok." />;
};

// ─── Modules Tab ──────────────────────────────────────────────────────────────

const ModulesTab: React.FC<{ items: ProductModuleDto[] }> = ({ items }) => {
    if (!items.length) return <EmptyState icon="grid-sq" text="Bu ürüne ait modül yok." />;
    return (
        <div className="row g-3">
            {items.map((m) => (
                <div key={m.id} className="col-md-6 col-lg-4">
                    <div className="card card-bordered h-100" style={{ overflow: "hidden" }}>
                        <div className="card-inner" style={{ overflow: "hidden" }}>
                            <div className="d-flex justify-content-between align-items-start mb-2">
                                <div className="min-w-0 me-2">
                                    <span className="fw-bold fs-14px d-block text-truncate">{m.name}</span>
                                    <code className="fs-11 text-primary text-truncate d-block">{m.moduleCode}</code>
                                </div>
                                <div className="d-flex flex-column gap-1 align-items-end flex-shrink-0">
                                    <StatusBadge active={m.isActive} />
                                    {m.isOptional && <span className="badge bg-outline-warning fs-10">Opsiyonel</span>}
                                </div>
                            </div>
                            {m.description && <p className="text-soft fs-12 mb-2" style={{ wordBreak: "break-word" }}>{m.description}</p>}
                            <div className="d-flex justify-content-between align-items-center border-top pt-2">
                                <span className="text-soft fs-12">Ek Fiyat</span>
                                <span className="fw-bold text-primary">{fmt(m.additionalPrice, m.currencyCode)}</span>
                            </div>
                            <div className="d-flex justify-content-between align-items-center mt-1">
                                <span className="text-soft fs-12">Sıra</span>
                                <span className="badge bg-outline-secondary">{m.sortOrder}</span>
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

// ─── Pricing Tiers Tab ────────────────────────────────────────────────────────

const PricingTiersTab: React.FC<{ items: SoftwarePricingTierDto[] }> = ({ items }) => {
    if (!items.length) return <EmptyState icon="layers" text="Fiyat kademesi tanımlanmamış." />;
    return (
        <div className="row g-3">
            {items.map((t, idx) => (
                <div key={t.id} className="col-md-6 col-xl-4">
                    <div className="card card-bordered h-100" style={{ overflow: "hidden" }}>
                        <div className="card-inner" style={{ overflow: "hidden" }}>
                            <div className="d-flex justify-content-between align-items-center mb-3">
                                <span className="badge bg-info text-truncate me-2" style={{ maxWidth: "70%" }}>
                                    Kademe #{idx + 1}
                                </span>
                                <StatusBadge active={t.isActive} />
                            </div>
                            <div className="text-center mb-3" style={{ overflow: "hidden" }}>
                                <span className="text-soft fs-12 d-block">Birim Fiyatı</span>
                                <span className="fs-1 fw-bold text-primary">{fmt(t.pricePerUnit)}</span>
                                <span className="text-soft ms-1 fs-12">
                                    {t.currencyCode} / {t.unitDefinitionName ?? "—"}
                                </span>
                            </div>
                            <div className="d-flex flex-column gap-1 fs-12">
                                {t.licenseOfferingName && (
                                    <div className="d-flex justify-content-between">
                                        <span className="text-soft">Lisans Teklifi</span>
                                        <span className="badge bg-outline-info text-truncate" style={{ maxWidth: 140 }}>
                                            {t.licenseOfferingName}
                                        </span>
                                    </div>
                                )}
                                <div className="d-flex justify-content-between">
                                    <span className="text-soft">Birim Aralığı</span>
                                    <span className="fw-medium">
                                        {t.minUnits} – {t.maxUnits ?? "∞"}
                                    </span>
                                </div>
                                {t.flatFee > 0 && (
                                    <div className="d-flex justify-content-between">
                                        <span className="text-soft">Sabit Ücret</span>
                                        <span className="fw-medium text-warning">
                                            {fmt(t.flatFee)} {t.currencyCode}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

// ─── License Offerings Tab ────────────────────────────────────────────────────

const LicenseOfferingsDetailTab: React.FC<{ items: ProductLicenseOfferingDto[] }> = ({ items }) => {
    if (!items.length) return <EmptyState icon="tag" text="Lisans teklifi tanımlanmamış." />;
    return (
        <div className="row g-3">
            {items.map((lo) => {
                const lm = LICENSE_MODEL_LABELS[lo.licenseModel];
                return (
                    <div key={lo.id} className="col-md-6 col-xl-4">
                        <div className={`card card-bordered h-100 ${lo.isActive ? "border-" + (lm?.color ?? "secondary") : ""}`} style={{ overflow: "hidden" }}>
                            <div className="card-inner" style={{ overflow: "hidden" }}>
                                <div className="d-flex justify-content-between align-items-start mb-2">
                                    <div className="min-w-0 me-2">
                                        <span className="fw-bold fs-14px d-block text-truncate">{lo.name}</span>
                                        <span className={`badge bg-${lm?.color ?? "secondary"} mt-1`}>{lm?.label ?? lo.licenseModel}</span>
                                    </div>
                                    <div className="d-flex flex-column align-items-end gap-1 flex-shrink-0">
                                        <StatusBadge active={lo.isActive} />
                                        <span className="text-soft fs-11">#{lo.sortOrder}</span>
                                    </div>
                                </div>

                                {lo.description && <p className="text-soft fs-12 mb-2">{lo.description}</p>}

                                <div className="text-center my-3 py-2 bg-light rounded">
                                    <span className="text-soft fs-11 d-block">Taban Fiyat</span>
                                    <span className="fs-1 fw-bold text-dark">{fmt(lo.basePrice)}</span>
                                    <span className="text-soft ms-1 fs-12">{lo.currencyCode}</span>
                                    {lo.billingPeriodValue && lo.billingPeriodUnit && (
                                        <span className="text-soft fs-11 d-block">
                                            / {lo.billingPeriodValue} {BILLING_UNIT_LABELS[lo.billingPeriodUnit]}
                                        </span>
                                    )}
                                </div>

                                <div className="d-flex flex-column gap-1 fs-12">
                                    {lo.maxSeats != null && (
                                        <div className="d-flex justify-content-between">
                                            <span className="text-soft">Maks. Koltuk</span>
                                            <span className="fw-medium">{lo.maxSeats}</span>
                                        </div>
                                    )}
                                    {lo.trialDays != null && (
                                        <div className="d-flex justify-content-between">
                                            <span className="text-soft">Deneme Süresi</span>
                                            <span className="badge bg-outline-secondary">{lo.trialDays} gün</span>
                                        </div>
                                    )}
                                    {lo.gracePeriodDays != null && (
                                        <div className="d-flex justify-content-between">
                                            <span className="text-soft">İzin Süresi</span>
                                            <span>{lo.gracePeriodDays} gün</span>
                                        </div>
                                    )}
                                    <div className="d-flex justify-content-between">
                                        <span className="text-soft">Oto. Yenileme</span>
                                        <StatusBadge active={lo.autoRenew} />
                                    </div>
                                    {(lo.validFrom || lo.validTo) && (
                                        <div className="border-top pt-1 mt-1">
                                            <span className="text-soft d-block">Geçerlilik</span>
                                            <span className="text-soft fs-11">
                                                {fmtDate(lo.validFrom)} – {fmtDate(lo.validTo)}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

// ─── Tab Builder ──────────────────────────────────────────────────────────────

const buildTabs = (product: ProductDetailDto): TabItem[] => {
    const kind = product.kind;
    // kind: 1=Fiziksel, 2=Yazılım, 3=Hizmet, 4=Abonelik
    const isPhysical = kind === 1;
    const isSoftware = kind === 2;
    const isLicensable = kind === 2 || kind === 3 || kind === 4;

    const tabs: TabItem[] = [
        { id: "general", label: "Genel Bilgi", content: <GeneralTab product={product} /> },
        { id: "profile", label: "Profil", content: <ProfileTab product={product} /> },
        {
            id: "categories",
            label: "Kategoriler",
            badge: product.categoryMaps.length || undefined,
            content: <CategoriesTab items={product.categoryMaps} />,
        },
        {
            id: "attributes",
            label: "Özellikler",
            badge: product.attributeValues.length || undefined,
            content: <AttributesTab items={product.attributeValues} />,
        },
        {
            id: "media",
            label: "Medya",
            badge: product.mediaItems.length || undefined,
            content: <MediaTab items={product.mediaItems} />,
        },
        {
            id: "prices",
            label: "Fiyatlar",
            badge: product.prices.length || undefined,
            content: <PricesTab items={product.prices} currencyCode={product.defaultCurrencyCode} />,
            hidden: isSoftware,
        },
        ...(isPhysical
            ? [
                  {
                      id: "variants",
                      label: "Varyantlar",
                      badge: product.variants.length || undefined,
                      content: <VariantsTab items={product.variants} />,
                  },
                  {
                      id: "inventory",
                      label: "Stok",
                      badge: product.inventories.length || undefined,
                      content: <InventoryTab items={product.inventories} />,
                  },
              ]
            : []),
        {
            id: "bundles",
            label: "Bundle",
            badge: product.bundleItems?.length || undefined,
            content: <BundlesTab items={product.bundleItems ?? []} />,
        },
        ...(isPhysical
            ? [
                  {
                      id: "suppliers",
                      label: "Tedarikçiler",
                      badge: product.supplierMaps.length || undefined,
                      content: <SuppliersTab items={product.supplierMaps} />,
                  },
              ]
            : []),
    ];

    if (isSoftware) {
        tabs.push({
            id: "modules",
            label: "Modüller",
            badge: product.modules?.length || undefined,
            content: <ModulesTab items={product.modules ?? []} />,
        });
    }

    if (isLicensable) {
        tabs.push({
            id: "license-offerings",
            label: "Lisans Teklifleri",
            badge: product.licenseOfferings?.length || undefined,
            content: <LicenseOfferingsDetailTab items={product.licenseOfferings ?? []} />,
        });
        tabs.push({
            id: "pricing-tiers",
            label: "Fiyat Kademeleri",
            badge: product.softwarePricingTiers?.length || undefined,
            content: <PricingTiersTab items={product.softwarePricingTiers ?? []} />,
        });
    }

    return tabs;
};

// ─── Main Page ─────────────────────────────────────────────────────────────────

const ProductDetailPage: React.FC = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const { data: product, isLoading } = useProductDetail(id);
    const { deleteMutation } = useProductMutations();
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [activeTab, setActiveTab] = useState("general");

    const productKind = product?.kind;
    const isPhysical = productKind === 1;
    const isSoftware = productKind === 2;
    const isLicensable = productKind === 2 || productKind === 3 || productKind === 4;

    // Tür değişince veya gizlenen sekmedeyken genel bilgiye dön (form sayfasıyla aynı mantık)
    useEffect(() => {
        const physicalOnlyTabs = ["variants", "suppliers", "inventory"];
        const softwareOnlyTabs = ["modules"];
        const licensableTabs = ["pricing-tiers", "license-offerings"];
        const softwareHiddenTabs = ["prices"];

        if (physicalOnlyTabs.includes(activeTab) && !isPhysical) {
            setActiveTab("general");
        }
        if (softwareOnlyTabs.includes(activeTab) && !isSoftware) {
            setActiveTab("general");
        }
        if (licensableTabs.includes(activeTab) && !isLicensable) {
            setActiveTab("general");
        }
        if (softwareHiddenTabs.includes(activeTab) && isSoftware) {
            setActiveTab("general");
        }
    }, [productKind, activeTab, isPhysical, isSoftware, isLicensable]);

    const handleDelete = async () => {
        if (!id) return;
        await deleteMutation.mutateAsync(id);
        navigate("/products");
    };

    const kind = product ? KIND_LABELS[product.kind] : undefined;
    const status = product ? STATUS_LABELS[product.status] : undefined;

    return (
        <>
            <Head title={product ? `${product.productCode} – ${product.name}` : "Ürün Detay"} />
            <Content>
                <PageHeader
                    title={product ? product.name : "Yükleniyor…"}
                    description={
                        product
                            ? `${product.productCode}${product.brand ? ` · ${product.brand}` : ""}${product.manufacturer ? ` · ${product.manufacturer}` : ""}`
                            : undefined
                    }
                    actions={
                        product ? (
                            <div className="d-flex gap-2 align-items-center flex-wrap">
                                {kind && (
                                    <span className={`badge bg-${kind.color}`}>
                                        <em className={`icon ni ni-${kind.icon} me-1`} />
                                        {kind.label}
                                    </span>
                                )}
                                {status && <span className={`badge badge-dim bg-${status.color}`}>{status.label}</span>}
                                <StatusBadge active={product.isActive} />
                                <Button color="primary" size="sm" onClick={() => navigate(`/products/${id}/edit`)}>
                                    <em className="icon ni ni-edit me-1" />
                                    Düzenle
                                </Button>
                                <Button color="danger" outline size="sm" onClick={() => setConfirmOpen(true)}>
                                    <em className="icon ni ni-trash me-1" />
                                    Sil
                                </Button>
                            </div>
                        ) : undefined
                    }
                />

                <Block className="" size="">
                    {isLoading ? (
                        <div className="card card-bordered">
                            <div className="card-inner d-flex align-items-center gap-3 py-5">
                                <span className="spinner-border spinner-border-sm text-primary" />
                                <span>Ürün yükleniyor…</span>
                            </div>
                        </div>
                    ) : !product ? (
                        <div className="card card-bordered">
                            <div className="card-inner text-center py-5">
                                <em className="icon ni ni-cross-circle fs-1 text-danger d-block mb-3" />
                                <p className="text-soft mb-3">Ürün bulunamadı veya yüklenirken hata oluştu.</p>
                                <Button color="light" size="sm" onClick={() => navigate("/products")}>
                                    <em className="icon ni ni-arrow-left me-1" />
                                    Listeye Dön
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <AppTabs tabs={buildTabs(product)} activeTab={activeTab} onTabChange={setActiveTab} />
                    )}
                </Block>
            </Content>

            <ConfirmDialog
                open={confirmOpen}
                title="Ürün Silinsin mi?"
                message={`"${product?.name}" ürünü kalıcı olarak silinecek. Bu işlem geri alınamaz.`}
                variant="danger"
                loading={deleteMutation.isPending}
                onCancel={() => setConfirmOpen(false)}
                onConfirm={handleDelete}
            />
        </>
    );
};

export default ProductDetailPage;
