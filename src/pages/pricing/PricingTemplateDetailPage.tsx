import React, { useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import {
  DataTableServer,
  DetailCard,
  DetailPage,
  DetailSection,
  EMPTY_DETAIL_VALUE,
  InlineAlert,
  StatusBadge,
} from "@/components/shared";
import type { DataColumn } from "@/components/shared";
import {
  usePricingTemplate,
  usePricingTemplateUsages,
} from "@/application/hooks/usePricingTemplates";
import { PRICING_TEMPLATE_KIND } from "@/domain/types/productOperations.types";
import type { PricingTemplateUsageDto } from "@/domain/types/productOperations.types";

const TEMPLATE_KIND_LABELS: Record<number, string> = {
  [PRICING_TEMPLATE_KIND.PricingRule]: "Fiyat kuralı",
  [PRICING_TEMPLATE_KIND.LicenseOffering]: "Lisans planı",
  [PRICING_TEMPLATE_KIND.ModulePrice]: "Modül fiyatı",
  [PRICING_TEMPLATE_KIND.ProductPrice]: "Ürün fiyatı",
  [PRICING_TEMPLATE_KIND.PriceListItem]: "Fiyat listesi kalemi",
};

const describeAdjustmentSummary = (payloadJson?: string): string => {
  if (!payloadJson) return EMPTY_DETAIL_VALUE;
  try {
    const payload = JSON.parse(payloadJson) as {
      type?: string;
      value?: number | null;
      operation?: string;
      mode?: string;
    };
    const typeLabel =
      payload.type === "percentage"
        ? "Yüzde"
        : payload.type === "fixed"
          ? "Sabit tutar"
          : payload.type === "multiplier"
            ? "Çarpan"
            : undefined;
    const hasAction = Boolean(payload.type || payload.operation || payload.value != null || payload.mode);
    const parts = [
      payload.mode === "unit" ? "Kademeli" : hasAction ? "Sabit" : undefined,
      payload.operation === "subtract" ? "Düşür" : payload.operation ? "Artır" : undefined,
      typeLabel,
      payload.value != null ? String(payload.value) : undefined,
    ].filter(Boolean);
    return parts.length ? parts.join(" · ") : EMPTY_DETAIL_VALUE;
  } catch {
    return EMPTY_DETAIL_VALUE;
  }
};

const PricingTemplateDetailPage: React.FC = () => {
  const { id } = useParams();

  const { data: template, isLoading, refetch } = usePricingTemplate(id);
  const { data: usages = [], isLoading: usagesLoading } = usePricingTemplateUsages(id);
  const missing = !isLoading && !template;

  const outdatedCount = useMemo(() => usages.filter((usage) => usage.isOutdated).length, [usages]);

  const columns: DataColumn<PricingTemplateUsageDto>[] = useMemo(
    () => [
      {
        key: "product",
        title: "Ürün",
        render: (it) => (
          <Link to={`/products/${it.productId}`} className="fw-medium">
            {it.productName || EMPTY_DETAIL_VALUE}
          </Link>
        ),
      },
      { key: "rule", title: "Kural", render: (it) => it.pricingRuleName || EMPTY_DETAIL_VALUE },
      {
        key: "code",
        title: "Kural Kodu",
        render: (it) => <span className="text-soft">{it.pricingRuleCode || EMPTY_DETAIL_VALUE}</span>,
      },
      {
        key: "offering",
        title: "Satış Planı",
        render: (it) => <span className="text-soft">{it.licenseOfferingName || "Tümü"}</span>,
      },
      {
        key: "version",
        title: "Sürüm",
        render: (it) =>
          it.isOutdated ? (
            <span className="badge bg-warning-dim text-warning">
              v{it.sourceTemplateVersion ?? "?"} → v{it.templateVersion}
            </span>
          ) : (
            <span className="badge bg-success-dim text-success">v{it.templateVersion} güncel</span>
          ),
      },
      { key: "status", title: "Durum", render: (it) => <StatusBadge active={it.isActive} /> },
    ],
    []
  );

  return (
    <DetailPage
      title={template?.name ?? "Fiyat Şablonu"}
      subtitle={
        template
          ? `${template.code} · v${template.version}${
              template.unitDefinitionName ? ` · ${template.unitDefinitionName}` : ""
            }`
          : undefined
      }
      breadcrumbs={[
        { label: "Fiyat Şablonları", to: "/pricing/templates" },
        { label: template?.name ?? "Detay" },
      ]}
      badges={template ? <StatusBadge active={template.isActive} /> : undefined}
      loading={isLoading}
      error={missing}
      errorMessage="Şablon bulunamadı veya yüklenirken bir hata oluştu."
      onRetry={() => {
        void refetch();
      }}
      backTo="/pricing/templates"
      editTo={template ? `/pricing/templates/${template.id}/edit` : undefined}
    >
      {template ? (
        <>
          {outdatedCount > 0 ? (
            <InlineAlert
              color="warning"
              className="mb-3"
              message={`${outdatedCount} kural şablonun güncel sürümünün gerisinde. Şablon kopyalanarak uygulandığı için sonradan yapılan değişiklikler ürünlere otomatik yansımaz. Bu kuralları toplu güncellemek için bir zam revizyonu oluşturup kapsamını bu şablon olarak seçebilirsiniz.`}
            />
          ) : null}

          <div className="row g-3">
            <div className="col-lg-6">
              <DetailCard title="Şablon Bilgileri" icon="file-text" fullHeight={false}>
                <DetailSection
                  items={[
                    { label: "Kod", value: template.code },
                    { label: "Ad", value: template.name },
                    {
                      label: "Tür",
                      value: TEMPLATE_KIND_LABELS[template.templateKind] ?? EMPTY_DETAIL_VALUE,
                    },
                    { label: "Para Birimi", value: template.currencyCode },
                    { label: "Birim", value: template.unitDefinitionName },
                    { label: "Sürüm", value: `v${template.version}` },
                    { label: "Kullanım", value: template.usageCount },
                    { label: "Açıklama", value: template.description, fullWidth: true },
                    { label: "Fiyat aksiyonu", value: describeAdjustmentSummary(template.payloadJson), fullWidth: true },
                  ]}
                />
              </DetailCard>
            </div>
            <div className="col-12">
              <DataTableServer
                title="Bu şablonu kullanan kurallar"
                columns={columns}
                items={usages}
                page={1}
                pageSize={usages.length || 1}
                totalItems={usages.length}
                onPageChange={() => undefined}
                isLoading={usagesLoading}
                emptyTitle="Bu şablon henüz hiçbir üründe kullanılmıyor"
                emptyIcon="tag"
                rowKey={(it) => it.pricingRuleId}
              />
            </div>
          </div>
        </>
      ) : null}
    </DetailPage>
  );
};

export default PricingTemplateDetailPage;
