import React, { useState } from "react";
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
  ProductSupplierMapDto,
  ProductPhysicalProfileDto,
  ProductSoftwareProfileDto,
  ProductServiceProfileDto,
  ProductSubscriptionProfileDto,
} from "@/shared/types/productOperations.types";

// ─── Constants ────────────────────────────────────────────────────────────────

const KIND_LABELS: Record<number, { label: string; color: string }> = {
  1: { label: "Fiziksel", color: "primary" },
  2: { label: "Yazılım", color: "info" },
  3: { label: "Hizmet", color: "success" },
  4: { label: "Abonelik", color: "warning" },
};

const STATUS_LABELS: Record<number, { label: string; color: string }> = {
  0: { label: "Taslak", color: "secondary" },
  1: { label: "Aktif", color: "success" },
  2: { label: "Pasif", color: "warning" },
  3: { label: "Arşivlendi", color: "danger" },
};

const PRICE_TYPE_LABELS: Record<number, string> = {
  1: "Satış",
  2: "Kurumsal",
  3: "Toptan",
  4: "Özel",
};

// ─── Shared UI Helpers ────────────────────────────────────────────────────────

const InfoRow: React.FC<{ label: string; value?: React.ReactNode }> = ({ label, value }) => (
  <div className="profile-ud-item">
    <div className="profile-ud wider">
      <span className="profile-ud-label">{label}</span>
      <span className="profile-ud-value">{value ?? <span className="text-muted">—</span>}</span>
    </div>
  </div>
);

const SectionCard: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="card card-bordered mb-3">
    <div className="card-inner">
      <h6 className="title mb-3">{title}</h6>
      {children}
    </div>
  </div>
);

const EmptyMessage: React.FC<{ text?: string }> = ({ text = "Kayıt bulunamadı." }) => (
  <p className="text-soft text-center py-3">{text}</p>
);

// ─── Tab Components ────────────────────────────────────────────────────────────

const GeneralTab: React.FC<{ product: ProductDetailDto }> = ({ product }) => {
  const kind = KIND_LABELS[product.kind];
  const status = STATUS_LABELS[product.status];

  return (
    <div className="row g-3">
      <div className="col-lg-6">
        <SectionCard title="Temel Bilgiler">
          <div className="profile-ud-list">
            <InfoRow label="Ürün Kodu" value={<span className="fw-medium">{product.productCode}</span>} />
            <InfoRow label="Adı" value={product.name} />
            <InfoRow label="Kısa Açıklama" value={product.shortDescription} />
            <InfoRow
              label="Tür"
              value={kind ? <span className={`badge badge-dim bg-${kind.color}`}>{kind.label}</span> : product.kind}
            />
            <InfoRow
              label="Durum"
              value={status ? <span className={`badge badge-dim bg-${status.color}`}>{status.label}</span> : product.status}
            />
            <InfoRow label="Aktif" value={<StatusBadge active={product.isActive} />} />
          </div>
        </SectionCard>
      </div>
      <div className="col-lg-6">
        <SectionCard title="Özellikler">
          <div className="profile-ud-list">
            <InfoRow label="Marka" value={product.brand} />
            <InfoRow label="Üretici" value={product.manufacturer} />
            <InfoRow label="Barkod" value={product.barcode} />
            <InfoRow label="Para Birimi" value={product.defaultCurrencyCode} />
            <InfoRow label="Ölçü Birimi" value={product.unitOfMeasure} />
            <InfoRow label="Vergi Oranı" value={product.taxRate != null ? `%${product.taxRate}` : undefined} />
            <InfoRow label="Vergi Kodu" value={product.taxCode} />
          </div>
        </SectionCard>
      </div>
      <div className="col-lg-6">
        <SectionCard title="Satış Ayarları">
          <div className="profile-ud-list">
            <InfoRow label="Satılabilir" value={<StatusBadge active={product.isSellable} />} />
            <InfoRow label="Satın Alınabilir" value={<StatusBadge active={product.isPurchasable} />} />
            <InfoRow label="Stok Takibi" value={<StatusBadge active={product.trackInventory} />} />
          </div>
        </SectionCard>
      </div>
      {product.tags && (
        <div className="col-lg-6">
          <SectionCard title="Etiketler">
            <div className="d-flex flex-wrap gap-1">
              {product.tags.split(",").map((tag) => (
                <span key={tag.trim()} className="badge bg-outline-primary">{tag.trim()}</span>
              ))}
            </div>
          </SectionCard>
        </div>
      )}
      {product.description && (
        <div className="col-12">
          <SectionCard title="Açıklama">
            <p className="text-soft mb-0" style={{ whiteSpace: "pre-wrap" }}>{product.description}</p>
          </SectionCard>
        </div>
      )}
      <div className="col-12">
        <SectionCard title="Sistem Bilgileri">
          <div className="profile-ud-list">
            <InfoRow label="Oluşturulma" value={new Date(product.createdAt).toLocaleString("tr-TR")} />
            <InfoRow
              label="Güncellenme"
              value={product.updatedAt ? new Date(product.updatedAt).toLocaleString("tr-TR") : undefined}
            />
          </div>
        </SectionCard>
      </div>
    </div>
  );
};

const AttributesTab: React.FC<{ items: ProductAttributeValueDto[] }> = ({ items }) => {
  if (!items.length) return <EmptyMessage text="Bu ürüne atanmış özellik değeri yok." />;
  return (
    <div className="table-responsive">
      <table className="table table-sm">
        <thead className="table-light">
          <tr>
            <th>Özellik ID</th>
            <th>Metin</th>
            <th>Sayı</th>
            <th>Boolean</th>
            <th>Tarih</th>
          </tr>
        </thead>
        <tbody>
          {items.map((it) => (
            <tr key={it.id}>
              <td><code className="fs-12px">{it.attributeDefinitionId.slice(0, 8)}…</code></td>
              <td>{it.valueText ?? <span className="text-muted">—</span>}</td>
              <td>{it.valueNumber != null ? it.valueNumber : <span className="text-muted">—</span>}</td>
              <td>
                {it.valueBool != null
                  ? <StatusBadge active={it.valueBool} />
                  : <span className="text-muted">—</span>}
              </td>
              <td>{it.valueDate ?? <span className="text-muted">—</span>}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const VariantsTab: React.FC<{ items: ProductVariantDto[] }> = ({ items }) => {
  if (!items.length) return <EmptyMessage text="Bu ürüne ait varyant yok." />;
  return (
    <div className="table-responsive">
      <table className="table table-sm">
        <thead className="table-light">
          <tr>
            <th>SKU</th>
            <th>Ad</th>
            <th>Barkod</th>
            <th>Ek Fiyat</th>
            <th>Ek Maliyet</th>
            <th>Durum</th>
          </tr>
        </thead>
        <tbody>
          {items.map((v) => (
            <tr key={v.id}>
              <td><span className="fw-medium">{v.sku}</span></td>
              <td>{v.name}</td>
              <td>{v.barcode ?? <span className="text-muted">—</span>}</td>
              <td>{v.additionalPrice != null ? v.additionalPrice.toLocaleString("tr-TR") : "—"}</td>
              <td>{v.additionalCost != null ? v.additionalCost.toLocaleString("tr-TR") : "—"}</td>
              <td><StatusBadge active={v.isActive} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const PricesTab: React.FC<{ items: ProductPriceDto[] }> = ({ items }) => {
  if (!items.length) return <EmptyMessage text="Bu ürüne ait fiyat tanımı yok." />;
  return (
    <div className="table-responsive">
      <table className="table table-sm">
        <thead className="table-light">
          <tr>
            <th>Tip</th>
            <th>Tutar</th>
            <th>Karşılaştırma</th>
            <th>Para Birimi</th>
            <th>Kanal</th>
            <th>Müşteri Grubu</th>
            <th>Geçerlilik</th>
          </tr>
        </thead>
        <tbody>
          {items.map((p) => (
            <tr key={p.id}>
              <td>
                <span className="badge badge-dim bg-primary">
                  {PRICE_TYPE_LABELS[p.priceType] ?? p.priceType}
                </span>
              </td>
              <td><span className="fw-medium">{p.amount.toLocaleString("tr-TR")}</span></td>
              <td>
                {p.compareAtAmount != null
                  ? <span className="text-soft text-decoration-line-through">{p.compareAtAmount.toLocaleString("tr-TR")}</span>
                  : <span className="text-muted">—</span>}
              </td>
              <td>{p.currencyCode}</td>
              <td>{p.salesChannel ?? <span className="text-muted">—</span>}</td>
              <td>{p.customerGroupCode ?? <span className="text-muted">—</span>}</td>
              <td className="text-soft" style={{ fontSize: 12 }}>
                {p.validFrom ? new Date(p.validFrom).toLocaleDateString("tr-TR") : ""}
                {p.validTo ? ` – ${new Date(p.validTo).toLocaleDateString("tr-TR")}` : ""}
                {!p.validFrom && !p.validTo ? "—" : ""}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const InventoryTab: React.FC<{ items: ProductInventoryDetailDto[] }> = ({ items }) => {
  if (!items.length) return <EmptyMessage text="Stok kaydı bulunamadı." />;
  return (
    <div className="table-responsive">
      <table className="table table-sm">
        <thead className="table-light">
          <tr>
            <th>Depo</th>
            <th>Eldeki</th>
            <th>Rezerve</th>
            <th>Mevcut</th>
            <th>Sipariş Noktası</th>
            <th>Sipariş Miktarı</th>
            <th>Durum</th>
          </tr>
        </thead>
        <tbody>
          {items.map((inv) => {
            const isLow = inv.reorderPoint != null && inv.quantityAvailable <= inv.reorderPoint;
            const isEmpty = inv.quantityAvailable <= 0;
            return (
              <tr key={inv.id}>
                <td><span className="fw-medium">{inv.warehouseCode ?? inv.warehouseId.slice(0, 8)}</span></td>
                <td>{inv.quantityOnHand}</td>
                <td className="text-soft">{inv.quantityReserved}</td>
                <td className={isEmpty ? "text-danger fw-medium" : isLow ? "text-warning fw-medium" : "text-success fw-medium"}>
                  {inv.quantityAvailable}
                </td>
                <td className="text-soft">{inv.reorderPoint ?? "—"}</td>
                <td className="text-soft">{inv.reorderQuantity ?? "—"}</td>
                <td>
                  {isEmpty
                    ? <span className="badge badge-dim bg-danger">Stoksuz</span>
                    : isLow
                    ? <span className="badge badge-dim bg-warning">Düşük</span>
                    : <span className="badge badge-dim bg-success">Normal</span>}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

const MediaTab: React.FC<{ items: ProductMediaItemDto[] }> = ({ items }) => {
  if (!items.length) return <EmptyMessage text="Medya dosyası bulunamadı." />;
  return (
    <div className="row g-3">
      {items.map((m) => (
        <div key={m.id} className="col-6 col-md-4 col-lg-3">
          <div className={`card card-bordered h-100 ${m.isPrimary ? "border-primary" : ""}`}>
            <div className="card-inner p-2 text-center">
              {m.thumbnailUrl || m.url ? (
                <img
                  src={m.thumbnailUrl ?? m.url}
                  alt={m.altText ?? "Ürün görseli"}
                  className="img-fluid rounded mb-2"
                  style={{ maxHeight: 120, objectFit: "contain" }}
                />
              ) : (
                <div
                  className="d-flex align-items-center justify-content-center bg-light rounded mb-2"
                  style={{ height: 120 }}
                >
                  <span className="text-muted">Görsel Yok</span>
                </div>
              )}
              {m.isPrimary && <span className="badge bg-primary mb-1">Ana Görsel</span>}
              <p className="text-soft mb-0" style={{ fontSize: 11 }}>{m.altText ?? m.mimeType ?? "—"}</p>
              <p className="text-soft mb-0" style={{ fontSize: 11 }}>Sıra: {m.sortOrder ?? "—"}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

const CategoriesTab: React.FC<{ items: ProductCategoryMapDetailDto[] }> = ({ items }) => {
  if (!items.length) return <EmptyMessage text="Kategori ataması yok." />;
  return (
    <div className="table-responsive">
      <table className="table table-sm">
        <thead className="table-light">
          <tr>
            <th>Kategori ID</th>
            <th>Tür</th>
            <th>Sıra</th>
          </tr>
        </thead>
        <tbody>
          {items.map((c) => (
            <tr key={c.id}>
              <td><code className="fs-12px">{c.productCategoryId.slice(0, 8)}…</code></td>
              <td>
                {c.isPrimary
                  ? <span className="badge bg-primary">Ana</span>
                  : <span className="text-muted">İkincil</span>}
              </td>
              <td>{c.sortOrder ?? "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const SuppliersTab: React.FC<{ items: ProductSupplierMapDto[] }> = ({ items }) => {
  if (!items.length) return <EmptyMessage text="Tedarikçi ataması yok." />;
  return (
    <div className="table-responsive">
      <table className="table table-sm">
        <thead className="table-light">
          <tr>
            <th>Tedarikçi ID</th>
            <th>Tedarikçi Ürün Kodu</th>
            <th>Maliyet</th>
            <th>Tesl. Süre (gün)</th>
            <th>Min. Sipariş</th>
            <th>Tercih</th>
          </tr>
        </thead>
        <tbody>
          {items.map((s) => (
            <tr key={s.id}>
              <td><code className="fs-12px">{s.productSupplierId.slice(0, 8)}…</code></td>
              <td>{s.supplierProductCode ?? <span className="text-muted">—</span>}</td>
              <td>{s.supplierCost != null ? s.supplierCost.toLocaleString("tr-TR") : "—"}</td>
              <td>{s.leadTimeInDays ?? "—"}</td>
              <td>{s.minOrderQuantity ?? "—"}</td>
              <td>
                {s.isPreferred
                  ? <span className="badge bg-success">Tercih</span>
                  : <span className="text-muted">—</span>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const PhysicalProfileTab: React.FC<{ p: ProductPhysicalProfileDto }> = ({ p }) => (
  <div className="profile-ud-list">
    <InfoRow label="Ağırlık (kg)" value={p.weight} />
    <InfoRow label="Genişlik (cm)" value={p.width} />
    <InfoRow label="Yükseklik (cm)" value={p.height} />
    <InfoRow label="Uzunluk (cm)" value={p.length} />
    <InfoRow label="Kargoya Verilir" value={<StatusBadge active={p.requiresShipping} />} />
    <InfoRow label="Kırılgan" value={<StatusBadge active={p.isFragile} />} />
    <InfoRow label="Tehlikeli Madde" value={<StatusBadge active={p.isHazardous} />} />
    <InfoRow label="Seri No Gerekli" value={<StatusBadge active={p.requiresSerialNumber} />} />
    <InfoRow label="Garanti (ay)" value={p.warrantyInMonths} />
  </div>
);

const SoftwareProfileTab: React.FC<{ p: ProductSoftwareProfileDto }> = ({ p }) => (
  <div className="profile-ud-list">
    <InfoRow label="Versiyon" value={p.version} />
    <InfoRow label="Koltuk Sayısı" value={p.seatCount} />
    <InfoRow
      label="İndirme URL"
      value={p.downloadUrl ? <a href={p.downloadUrl} target="_blank" rel="noreferrer">{p.downloadUrl}</a> : undefined}
    />
    <InfoRow label="Release Notes" value={p.releaseNotes} />
  </div>
);

const ServiceProfileTab: React.FC<{ p: ProductServiceProfileDto }> = ({ p }) => (
  <div className="profile-ud-list">
    <InfoRow label="Süre (dk)" value={p.durationInMinutes} />
    <InfoRow label="Maks. Eş Zamanlı" value={p.maxConcurrentBooking} />
  </div>
);

const SubscriptionProfileTab: React.FC<{ p: ProductSubscriptionProfileDto }> = ({ p }) => (
  <div className="profile-ud-list">
    <InfoRow label="Faturalama Birimi" value={p.billingPeriodUnit} />
    <InfoRow label="Faturalama Değeri" value={p.billingPeriodValue} />
    <InfoRow label="Deneme Süresi (gün)" value={p.trialDays} />
    <InfoRow label="Otomatik Yenileme" value={<StatusBadge active={p.autoRenew} />} />
    <InfoRow label="İptal Politikası" value={p.cancellationPolicy} />
  </div>
);

const ProfileTab: React.FC<{ product: ProductDetailDto }> = ({ product }) => {
  const { kind, physicalProfile, softwareProfile, serviceProfile, subscriptionProfile } = product;
  if (kind === 1 && physicalProfile) return <PhysicalProfileTab p={physicalProfile} />;
  if (kind === 2 && softwareProfile) return <SoftwareProfileTab p={softwareProfile} />;
  if (kind === 3 && serviceProfile) return <ServiceProfileTab p={serviceProfile} />;
  if (kind === 4 && subscriptionProfile) return <SubscriptionProfileTab p={subscriptionProfile} />;
  return <EmptyMessage text="Bu ürün türü için profil bilgisi yok." />;
};

// ─── Main Page ─────────────────────────────────────────────────────────────────

const buildTabs = (product: ProductDetailDto): TabItem[] => [
  {
    id: "general",
    label: "Genel Bilgi",
    content: <GeneralTab product={product} />,
  },
  {
    id: "attributes",
    label: "Özellikler",
    badge: product.attributeValues.length || undefined,
    content: <AttributesTab items={product.attributeValues} />,
  },
  {
    id: "variants",
    label: "Varyantlar",
    badge: product.variants.length || undefined,
    content: <VariantsTab items={product.variants} />,
  },
  {
    id: "prices",
    label: "Fiyatlar",
    badge: product.prices.length || undefined,
    content: <PricesTab items={product.prices} />,
  },
  {
    id: "inventory",
    label: "Stok",
    badge: product.inventories.length || undefined,
    content: <InventoryTab items={product.inventories} />,
  },
  {
    id: "media",
    label: "Medya",
    badge: product.mediaItems.length || undefined,
    content: <MediaTab items={product.mediaItems} />,
  },
  {
    id: "categories",
    label: "Kategoriler",
    badge: product.categoryMaps.length || undefined,
    content: <CategoriesTab items={product.categoryMaps} />,
  },
  {
    id: "suppliers",
    label: "Tedarikçiler",
    badge: product.supplierMaps.length || undefined,
    content: <SuppliersTab items={product.supplierMaps} />,
  },
  {
    id: "profile",
    label: "Profil",
    content: <ProfileTab product={product} />,
  },
];

const ProductDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { data: product, isLoading } = useProductDetail(id);
  const { deleteMutation } = useProductMutations();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("general");

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
            product ? `${product.productCode}${product.brand ? ` · ${product.brand}` : ""}` : undefined
          }
          actions={
            product ? (
              <div className="d-flex gap-2 align-items-center flex-wrap">
                {kind && <span className={`badge badge-dim bg-${kind.color}`}>{kind.label}</span>}
                {status && <span className={`badge badge-dim bg-${status.color}`}>{status.label}</span>}
                <StatusBadge active={product.isActive} />
                <Button color="primary" size="sm" onClick={() => navigate(`/products/${id}/edit`)}>
                  Düzenle
                </Button>
                <Button color="danger" outline size="sm" onClick={() => setConfirmOpen(true)}>
                  Sil
                </Button>
              </div>
            ) : undefined
          }
        />

        <Block>
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
                <p className="text-soft mb-3">Ürün bulunamadı veya yüklenirken hata oluştu.</p>
                <Button color="light" size="sm" className="" onClick={() => navigate("/products")}>
                  Listeye Dön
                </Button>
              </div>
            </div>
          ) : (
            <AppTabs
              tabs={buildTabs(product)}
              activeTab={activeTab}
              onTabChange={setActiveTab}
            />
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
