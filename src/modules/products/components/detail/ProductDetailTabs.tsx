import React from "react";
import type { TabItem } from "@/modules/shared/components/AppTabs";
import type {
  ProductDetailDto,
  ProductAttributeValueDto,
  ProductVariantDto,
  ProductPriceDto,
  ProductInventoryDetailDto,
  ProductMediaItemDto,
  ProductCategoryMapDetailDto,
  ProductSupplierMapDto,
  ProductModuleDto,
  SoftwarePricingTierDto,
  ProductLicenseOfferingDto,
} from "@/shared/types/productOperations.types";
import {
  KIND_LABELS,
  STATUS_LABELS,
  PRICE_TYPE_LABELS,
  LICENSE_MODEL_LABELS,
  ATTRIBUTE_DATA_TYPE_LABELS,
  BILLING_UNIT_LABELS,
  INVENTORY_POLICY_LABELS,
} from "./constants";
import { fmt, fmtDate, fmtDateTime, parseJsonArray, getAttributeDisplayValue } from "./utils";
import {
  InfoRow,
  StatTile,
  TabEmpty,
  DetailCard,
  DetailRow,
  StatusBadge,
} from "./shared";

// ─── General Tab ─────────────────────────────────────────────────────────────

export const GeneralTab: React.FC<{ product: ProductDetailDto }> = ({ product }) => (
  <div className="row g-4">
    <div className="col-lg-6">
      <DetailCard title="Ürün Bilgileri" icon="package" fullHeight={false}>
        <InfoRow label="Ürün Kodu" value={<code>{product.productCode}</code>} />
        <InfoRow label="Marka" value={product.brand} />
        <InfoRow label="Üretici" value={product.manufacturer} />
        <InfoRow label="Barkod" value={product.barcode ? <code>{product.barcode}</code> : undefined} />
        <InfoRow label="Para Birimi" value={product.defaultCurrencyCode} />
        <InfoRow label="Ölçü Birimi" value={product.unitDefinitionName} />
      </DetailCard>
    </div>
    <div className="col-lg-6">
      <DetailCard title="Vergi & Durum" icon="coins" fullHeight={false}>
        <InfoRow
          label="Vergi Oranı"
          value={
            product.taxRate != null ? (
              <span className="badge bg-outline-info">%{product.taxRate}</span>
            ) : undefined
          }
        />
        <InfoRow label="Vergi Kodu" value={product.taxCode} />
        <InfoRow
          label="Tür"
          value={
            KIND_LABELS[product.kind] ? (
              <span className={`badge bg-${KIND_LABELS[product.kind].color}`}>
                {KIND_LABELS[product.kind].label}
              </span>
            ) : undefined
          }
        />
        <InfoRow
          label="Durum"
          value={
            STATUS_LABELS[product.status] ? (
              <span className={`badge badge-dim bg-${STATUS_LABELS[product.status].color}`}>
                {STATUS_LABELS[product.status].label}
              </span>
            ) : undefined
          }
        />
      </DetailCard>
    </div>

    {product.description && (
      <div className="col-12">
        <DetailCard title="Açıklama" icon="text" fullHeight={false}>
          <p className="mb-0 text-base" style={{ whiteSpace: "pre-wrap", lineHeight: 1.75, wordBreak: "break-word" }}>
            {product.description}
          </p>
        </DetailCard>
      </div>
    )}

    {product.tags && (
      <div className="col-12">
        <div className="card card-bordered">
          <div className="card-inner py-3">
            <span className="overline-title text-soft mb-2 d-block">Etiketler</span>
            <div className="d-flex flex-wrap gap-1">
              {product.tags.split(",").map((tag) => (
                <span key={tag.trim()} className="badge bg-outline-primary">
                  {tag.trim()}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    )}

    <div className="col-12">
      <div className="card card-bordered">
        <div className="card-inner py-3">
          <div className="row g-3">
            <div className="col-sm-4">
              <span className="text-soft fs-11 d-block">Oluşturulma</span>
              <span className="fs-13px fw-medium">{fmtDateTime(product.createdAt)}</span>
            </div>
            <div className="col-sm-4">
              <span className="text-soft fs-11 d-block">Son Güncelleme</span>
              <span className="fs-13px fw-medium">{fmtDateTime(product.updatedAt)}</span>
            </div>
            <div className="col-sm-4 min-w-0">
              <span className="text-soft fs-11 d-block">Kayıt ID</span>
              <code className="fs-11 text-truncate d-block">{product.id}</code>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

// ─── Attributes Tab ───────────────────────────────────────────────────────────

export const AttributesTab: React.FC<{ items: ProductAttributeValueDto[] }> = ({ items }) => {
  if (!items.length) {
    return <TabEmpty icon="list" title="Özellik yok" description="Bu ürüne atanmış özellik değeri bulunmuyor." />;
  }
  return (
    <div className="card card-bordered">
      <div className="table-responsive">
        <table className="table table-middle mb-0">
          <thead className="table-light">
            <tr>
              <th>Özellik</th>
              <th>Anahtar</th>
              <th>Tip</th>
              <th className="text-end">Değer</th>
            </tr>
          </thead>
          <tbody>
            {items.map((it) => (
              <tr key={it.id}>
                <td className="fw-medium">{it.attributeDisplayName ?? it.attributeDefinitionId.slice(0, 8)}</td>
                <td>
                  <code className="fs-12">{it.attributeKey ?? "—"}</code>
                </td>
                <td>
                  <span className="badge bg-outline-secondary">
                    {ATTRIBUTE_DATA_TYPE_LABELS[it.attributeDataType ?? 0] ?? "—"}
                  </span>
                </td>
                <td className="text-end fw-medium">{getAttributeDisplayValue(it)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ─── Categories Tab ───────────────────────────────────────────────────────────

export const CategoriesTab: React.FC<{ items: ProductCategoryMapDetailDto[] }> = ({ items }) => {
  if (!items.length) {
    return <TabEmpty icon="folder" title="Kategori yok" description="Bu ürüne kategori atanmamış." />;
  }
  const sorted = [...items].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
  return (
    <div className="row g-3">
      {sorted.map((c) => (
        <div key={c.id} className="col-md-6 col-xl-4">
          <div className={`card card-bordered h-100 ${c.isPrimary ? "border-primary" : ""}`}>
            <div className="card-inner">
              <div className="d-flex justify-content-between align-items-start mb-2">
                {c.isPrimary ? (
                  <span className="badge bg-primary">
                    <em className="icon ni ni-star-fill me-1" />
                    Ana Kategori
                  </span>
                ) : (
                  <span className="badge bg-outline-light text-soft">İkincil</span>
                )}
                <span className="text-soft fs-11">Sıra {c.sortOrder ?? 0}</span>
              </div>
              <h6 className="title mb-1">{c.categoryName ?? "Kategori"}</h6>
              {c.categoryCode && <code className="fs-12 text-primary">{c.categoryCode}</code>}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

// ─── Variants Tab ─────────────────────────────────────────────────────────────

export const VariantsTab: React.FC<{ items: ProductVariantDto[] }> = ({ items }) => {
  if (!items.length) {
    return <TabEmpty icon="layers" title="Varyant yok" description="Bu ürüne ait varyant tanımlanmamış." />;
  }
  return (
    <div className="row g-3">
      {items.map((v) => (
        <div key={v.id} className="col-md-6 col-xl-4">
          <DetailCard title={v.name} icon="layers" fullHeight={false}>
            <DetailRow label="SKU" value={<code>{v.sku}</code>} />
            {v.barcode && <DetailRow label="Barkod" value={<code>{v.barcode}</code>} />}
            <DetailRow label="Durum" value={<StatusBadge active={v.isActive} />} />
            {v.additionalPrice != null && (
              <DetailRow label="Ek Fiyat" value={<span className="text-success">+{fmt(v.additionalPrice)}</span>} />
            )}
          </DetailCard>
        </div>
      ))}
    </div>
  );
};

// ─── Prices Tab ───────────────────────────────────────────────────────────────

export const PricesTab: React.FC<{ items: ProductPriceDto[] }> = ({ items }) => {
  if (!items.length) {
    return <TabEmpty icon="sign-try" title="Fiyat yok" description="Bu ürüne ait fiyat tanımı bulunmuyor." />;
  }
  return (
    <div className="row g-3">
      {items.map((p) => {
        const pt = PRICE_TYPE_LABELS[p.priceType];
        return (
          <div key={p.id} className="col-md-6 col-xl-4">
            <div className="card card-bordered h-100">
              <div className="card-inner text-center">
                <span className={`badge bg-${pt?.color ?? "secondary"} mb-3`}>{pt?.label ?? p.priceType}</span>
                <div className="fs-1 fw-bold text-dark mb-1">{fmt(p.amount)}</div>
                <span className="text-soft fs-12">{p.currencyCode}</span>
                {p.compareAtAmount != null && (
                  <p className="text-soft text-decoration-line-through mb-0 mt-2 fs-13px">
                    {fmt(p.compareAtAmount)} {p.currencyCode}
                  </p>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

// ─── Inventory Tab ────────────────────────────────────────────────────────────

export const InventoryTab: React.FC<{ items: ProductInventoryDetailDto[] }> = ({ items }) => {
  if (!items.length) {
    return <TabEmpty icon="box" title="Stok yok" description="Stok kaydı bulunamadı." />;
  }
  const totalOnHand = items.reduce((s, i) => s + i.quantityOnHand, 0);
  const totalReserved = items.reduce((s, i) => s + i.quantityReserved, 0);
  const totalAvailable = items.reduce((s, i) => s + i.quantityAvailable, 0);

  return (
    <>
      <div className="row g-3 mb-4">
        <div className="col-md-4">
          <StatTile label="Toplam Eldeki" value={totalOnHand} icon="box" color="primary" />
        </div>
        <div className="col-md-4">
          <StatTile label="Toplam Rezerve" value={totalReserved} icon="lock" color="warning" />
        </div>
        <div className="col-md-4">
          <StatTile
            label="Toplam Mevcut"
            value={totalAvailable}
            icon="check-circle"
            color={totalAvailable <= 0 ? "danger" : "success"}
          />
        </div>
      </div>
      <div className="card card-bordered">
        <div className="table-responsive">
          <table className="table table-middle mb-0">
            <thead className="table-light">
              <tr>
                <th>Depo</th>
                <th className="text-end">Eldeki</th>
                <th className="text-end">Rezerve</th>
                <th className="text-end">Mevcut</th>
                <th>Durum</th>
              </tr>
            </thead>
            <tbody>
              {items.map((inv) => {
                const isEmpty = inv.quantityAvailable <= 0;
                const isLow =
                  inv.reorderPoint != null && inv.quantityAvailable <= inv.reorderPoint && !isEmpty;
                const statusColor = isEmpty ? "danger" : isLow ? "warning" : "success";
                const statusLabel = isEmpty ? "Stoksuz" : isLow ? "Düşük" : "Normal";
                return (
                  <tr key={inv.id}>
                    <td className="fw-medium">{inv.warehouseCode ?? inv.warehouseId.slice(0, 8)}</td>
                    <td className="text-end">{inv.quantityOnHand}</td>
                    <td className="text-end">{inv.quantityReserved}</td>
                    <td className="text-end fw-bold">{inv.quantityAvailable}</td>
                    <td>
                      <span className={`badge bg-${statusColor}`}>{statusLabel}</span>
                      {inv.inventoryPolicy != null && (
                        <span className="text-soft fs-11 ms-2">
                          {INVENTORY_POLICY_LABELS[inv.inventoryPolicy]}
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

// ─── Media Tab ────────────────────────────────────────────────────────────────

export const MediaTab: React.FC<{ items: ProductMediaItemDto[] }> = ({ items }) => {
  if (!items.length) {
    return <TabEmpty icon="img" title="Medya yok" description="Ürün görseli veya medya dosyası eklenmemiş." />;
  }
  const sorted = [...items].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
  return (
    <div className="row g-3">
      {sorted.map((m) => (
        <div key={m.id} className="col-6 col-md-4 col-lg-3">
          <div className={`card card-bordered h-100 overflow-hidden ${m.isPrimary ? "border-primary shadow-sm" : ""}`}>
            {m.isPrimary && (
              <div className="card-header py-1 bg-primary text-white text-center fs-11">
                <em className="icon ni ni-star me-1" />
                Ana Görsel
              </div>
            )}
            <div className="card-inner p-3 text-center">
              <a href={m.url} target="_blank" rel="noreferrer" className="d-block mb-2">
                <div
                  className="d-flex align-items-center justify-content-center rounded bg-light"
                  style={{ height: 140 }}
                >
                  {m.thumbnailUrl || m.url ? (
                    <img
                      src={m.thumbnailUrl ?? m.url}
                      alt={m.altText ?? "Ürün görseli"}
                      className="rounded"
                      style={{ maxHeight: 120, maxWidth: "100%", objectFit: "contain" }}
                    />
                  ) : (
                    <em className="icon ni ni-img fs-2 text-soft" />
                  )}
                </div>
              </a>
              {m.altText && <p className="text-soft fs-11 mb-1 text-truncate">{m.altText}</p>}
              {m.mimeType && <span className="badge bg-outline-secondary fs-10">{m.mimeType}</span>}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

// ─── Suppliers ────────────────────────────────────────────────────────────────

export const SuppliersTab: React.FC<{ items: ProductSupplierMapDto[] }> = ({ items }) => {
  if (!items.length) {
    return <TabEmpty icon="truck" title="Tedarikçi yok" description="Tedarikçi eşlemesi bulunmuyor." />;
  }
  return (
    <div className="row g-3">
      {items.map((s) => (
        <div key={s.id} className="col-md-6 col-xl-4">
          <div className={`card card-bordered h-100 ${s.isPreferred ? "border-success" : ""}`}>
            <div className="card-inner">
              <div className="d-flex justify-content-between mb-2">
                <code className="fs-12">{s.productSupplierId.slice(0, 12)}…</code>
                {s.isPreferred && (
                  <span className="badge bg-success">
                    <em className="icon ni ni-star-fill me-1" />
                    Tercih
                  </span>
                )}
              </div>
              <InfoRow label="Tedarikçi Kodu" value={s.supplierProductCode} />
              <InfoRow label="Maliyet" value={s.supplierCost != null ? fmt(s.supplierCost) : undefined} />
              <InfoRow
                label="Teslimat"
                value={s.leadTimeInDays != null ? `${s.leadTimeInDays} gün` : undefined}
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

// ─── Profile Tab ──────────────────────────────────────────────────────────────

export const ProfileTab: React.FC<{ product: ProductDetailDto }> = ({ product }) => {
  const { kind, physicalProfile: phys, softwareProfile: sw, serviceProfile: svc, subscriptionProfile: sub } =
    product;

  if (kind === 1 && phys) {
    return (
      <div className="row g-4">
        <div className="col-lg-8">
          <DetailCard title="Boyutlar & Ağırlık" icon="ruler">
            <div className="row g-3 text-center">
              {[
                { label: "Ağırlık (kg)", value: phys.weight },
                { label: "Genişlik (cm)", value: phys.width },
                { label: "Yükseklik (cm)", value: phys.height },
                { label: "Uzunluk (cm)", value: phys.length },
              ].map(({ label, value }) => (
                <div key={label} className="col-6 col-md-3">
                  <div className="p-3 rounded bg-light">
                    <div className="fs-3 fw-bold text-primary">{value ?? "—"}</div>
                    <div className="text-soft fs-11">{label}</div>
                  </div>
                </div>
              ))}
            </div>
          </DetailCard>
        </div>
        <div className="col-lg-4">
          <DetailCard title="Kargo & Garanti" icon="truck">
            <InfoRow label="Kargoya Verilir" value={<StatusBadge active={phys.requiresShipping} />} />
            <InfoRow label="Kırılgan" value={<StatusBadge active={phys.isFragile} />} />
            <InfoRow label="Tehlikeli Madde" value={<StatusBadge active={phys.isHazardous} />} />
            <InfoRow label="Seri No Gerekli" value={<StatusBadge active={phys.requiresSerialNumber} />} />
            <InfoRow
              label="Garanti"
              value={phys.warrantyInMonths != null ? `${phys.warrantyInMonths} ay` : undefined}
            />
          </DetailCard>
        </div>
      </div>
    );
  }

  if (kind === 2 && sw) {
    const platforms = parseJsonArray(sw.supportedPlatformsJson);
    return (
      <div className="row g-4">
        <div className="col-lg-6">
          <DetailCard title="Yazılım Bilgileri" icon="laptop">
            <InfoRow
              label="Versiyon"
              value={sw.version ? <span className="badge bg-outline-info">v{sw.version}</span> : undefined}
            />
            <InfoRow
              label="İndirme"
              value={
                sw.downloadUrl ? (
                  <a href={sw.downloadUrl} target="_blank" rel="noreferrer" className="link link-primary">
                    {sw.downloadUrl}
                  </a>
                ) : undefined
              }
            />
            {platforms.length > 0 && (
              <div className="pt-2">
                <span className="text-soft fs-12 d-block mb-2">Desteklenen Platformlar</span>
                <div className="d-flex flex-wrap gap-1">
                  {platforms.map((p) => (
                    <span key={p} className="badge bg-outline-primary">
                      {p}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </DetailCard>
        </div>
        {(sw.releaseNotes || sw.systemRequirementsJson) && (
          <div className="col-lg-6">
            <DetailCard title="Teknik Detaylar" icon="code">
              {sw.releaseNotes && (
                <>
                  <span className="overline-title text-soft mb-2 d-block">Sürüm Notları</span>
                  <p className="mb-3" style={{ whiteSpace: "pre-wrap", lineHeight: 1.7 }}>
                    {sw.releaseNotes}
                  </p>
                </>
              )}
              {sw.systemRequirementsJson && (
                <>
                  <span className="overline-title text-soft mb-2 d-block">Sistem Gereksinimleri</span>
                  <pre className="bg-light rounded p-3 fs-12 mb-0" style={{ whiteSpace: "pre-wrap" }}>
                    {sw.systemRequirementsJson}
                  </pre>
                </>
              )}
            </DetailCard>
          </div>
        )}
      </div>
    );
  }

  if (kind === 3 && svc) {
    return (
      <div className="row g-4">
        <div className="col-md-6">
          <StatTile label="Süre (dk)" value={svc.durationInMinutes ?? "—"} icon="clock" color="success" />
        </div>
        <div className="col-md-6">
          <StatTile
            label="Maks. Eş Zamanlı"
            value={svc.maxConcurrentBooking ?? "—"}
            icon="users"
            color="info"
          />
        </div>
        {svc.serviceAreaJson && (
          <div className="col-12">
            <DetailCard title="Hizmet Bölgesi" icon="map" fullHeight={false}>
              <pre className="bg-light rounded p-3 fs-12 mb-0">{svc.serviceAreaJson}</pre>
            </DetailCard>
          </div>
        )}
      </div>
    );
  }

  if (kind === 4 && sub) {
    return (
      <DetailCard title="Abonelik Profili" icon="repeat">
        <InfoRow
          label="Faturalama"
          value={
            sub.billingPeriodValue && sub.billingPeriodUnit
              ? `${sub.billingPeriodValue} ${BILLING_UNIT_LABELS[sub.billingPeriodUnit] ?? ""}`
              : undefined
          }
        />
        <InfoRow label="Deneme" value={sub.trialDays != null ? `${sub.trialDays} gün` : undefined} />
        <InfoRow label="İzin Süresi" value={sub.gracePeriodDays != null ? `${sub.gracePeriodDays} gün` : undefined} />
        <InfoRow label="Otomatik Yenileme" value={<StatusBadge active={sub.autoRenew} />} />
        <InfoRow label="İptal Politikası" value={sub.cancellationPolicy} />
      </DetailCard>
    );
  }

  return <TabEmpty icon="info" title="Profil yok" description="Bu ürün türü için profil bilgisi tanımlanmamış." />;
};

// ─── Modules Tab ──────────────────────────────────────────────────────────────

export const ModulesTab: React.FC<{ items: ProductModuleDto[] }> = ({ items }) => {
  if (!items.length) {
    return <TabEmpty icon="grid" title="Modül yok" description="Bu yazılım ürününe modül eklenmemiş." />;
  }
  return (
    <div className="row g-3">
      {items.map((m) => (
        <div key={m.id} className="col-md-6 col-xl-4">
          <DetailCard title={m.name} subtitle={m.moduleCode} icon="grid-alt" fullHeight={false}>
            {m.description && <p className="text-soft fs-13px mb-3">{m.description}</p>}
            <DetailRow label="Ek Fiyat" value={fmt(m.additionalPrice, m.currencyCode)} />
            <DetailRow label="Durum" value={<StatusBadge active={m.isActive} />} />
            {m.isOptional && (
              <span className="badge bg-outline-warning mt-2">Opsiyonel modül</span>
            )}
          </DetailCard>
        </div>
      ))}
    </div>
  );
};

// ─── License Offerings Tab ────────────────────────────────────────────────────

export const LicenseOfferingsTab: React.FC<{ items: ProductLicenseOfferingDto[] }> = ({ items }) => {
  if (!items.length) {
    return <TabEmpty icon="tag" title="Lisans teklifi yok" description="Lisans modeli tanımlanmamış." />;
  }
  const sorted = [...items].sort((a, b) => a.sortOrder - b.sortOrder);
  return (
    <div className="row g-4">
      {sorted.map((lo) => {
        const lm = LICENSE_MODEL_LABELS[lo.licenseModel];
        return (
          <div key={lo.id} className="col-md-6 col-xl-4">
            <div
              className={`card card-bordered h-100 ${lo.isActive ? `border-${lm?.color ?? "primary"}` : "opacity-75"}`}
            >
              <div className="card-inner">
                <div className="d-flex justify-content-between align-items-start mb-3">
                  <div>
                    <h6 className="title mb-1">{lo.name}</h6>
                    <span className={`badge bg-${lm?.color ?? "secondary"}`}>{lm?.label ?? lo.licenseModel}</span>
                  </div>
                  <StatusBadge active={lo.isActive} />
                </div>
                {lo.description && <p className="text-soft fs-13px mb-3">{lo.description}</p>}
                <div className="text-center py-3 px-2 rounded bg-light mb-3">
                  <span className="text-soft fs-11 d-block mb-1">Taban Fiyat</span>
                  <span className="fs-2 fw-bold text-dark">{fmt(lo.basePrice)}</span>
                  <span className="text-soft ms-1">{lo.currencyCode}</span>
                  {lo.billingPeriodValue && lo.billingPeriodUnit && (
                    <span className="text-soft fs-11 d-block mt-1">
                      / {lo.billingPeriodValue} {BILLING_UNIT_LABELS[lo.billingPeriodUnit]}
                    </span>
                  )}
                </div>
                <InfoRow label="Maks. Koltuk" value={lo.maxSeats} />
                <InfoRow label="Deneme" value={lo.trialDays != null ? `${lo.trialDays} gün` : undefined} />
                <InfoRow label="Oto. Yenileme" value={<StatusBadge active={lo.autoRenew} />} />
                {lo.convertToOfferingName && (
                  <InfoRow label="Dönüşüm" value={lo.convertToOfferingName} />
                )}
                <InfoRow
                  label="Geçerlilik"
                  value={`${fmtDate(lo.validFrom)} – ${fmtDate(lo.validTo)}`}
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

// ─── Pricing Tiers Tab ────────────────────────────────────────────────────────

export const PricingTiersTab: React.FC<{ items: SoftwarePricingTierDto[] }> = ({ items }) => {
  if (!items.length) {
    return <TabEmpty icon="layers" title="Fiyat kademesi yok" description="Birim bazlı fiyat kademesi tanımlanmamış." />;
  }
  return (
    <div className="card card-bordered">
      <div className="table-responsive">
        <table className="table table-middle mb-0">
          <thead className="table-light">
            <tr>
              <th>Lisans Teklifi</th>
              <th>Birim</th>
              <th>Aralık</th>
              <th className="text-end">Birim Fiyat</th>
              <th className="text-end">Sabit Ücret</th>
              <th>Durum</th>
            </tr>
          </thead>
          <tbody>
            {items.map((t) => (
              <tr key={t.id}>
                <td className="fw-medium">{t.licenseOfferingName ?? "—"}</td>
                <td>
                  {t.unitDefinitionName ?? t.unitDefinitionCode ?? "—"}
                  {t.unitDefinitionCode && (
                    <code className="fs-11 text-soft ms-1">({t.unitDefinitionCode})</code>
                  )}
                </td>
                <td>
                  {t.minUnits} – {t.maxUnits ?? "∞"}
                </td>
                <td className="text-end fw-bold text-primary">
                  {fmt(t.pricePerUnit)} {t.currencyCode}
                </td>
                <td className="text-end">
                  {t.flatFee > 0 ? `${fmt(t.flatFee)} ${t.currencyCode}` : "—"}
                </td>
                <td>
                  <StatusBadge active={t.isActive} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ─── Tab Builder ──────────────────────────────────────────────────────────────

export const buildProductDetailTabs = (product: ProductDetailDto): TabItem[] => {
  const { kind } = product;
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
      content: <PricesTab items={product.prices} />,
      hidden: isSoftware,
    },
  ];

  if (isPhysical) {
    tabs.push(
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
      }
    );
  }

  if (isPhysical) {
    tabs.push({
      id: "suppliers",
      label: "Tedarikçiler",
      badge: product.supplierMaps.length || undefined,
      content: <SuppliersTab items={product.supplierMaps} />,
    });
  }

  if (isSoftware) {
    tabs.push({
      id: "modules",
      label: "Modüller",
      badge: product.modules?.length || undefined,
      content: <ModulesTab items={product.modules ?? []} />,
    });
  }

  if (isLicensable) {
    tabs.push(
      {
        id: "license-offerings",
        label: "Lisans Teklifleri",
        badge: product.licenseOfferings?.length || undefined,
        content: <LicenseOfferingsTab items={product.licenseOfferings ?? []} />,
      },
      {
        id: "pricing-tiers",
        label: "Fiyat Kademeleri",
        badge: product.softwarePricingTiers?.length || undefined,
        content: <PricingTiersTab items={product.softwarePricingTiers ?? []} />,
      }
    );
  }

  return tabs;
};
