import React, { useMemo } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Button } from "reactstrap";
import Content from "@/layout/content/Content";
import Head from "@/layout/head/Head";
import Icon from "@/components/icon/Icon";
import { Block } from "@/components/Component";
import PageHeader from "@/modules/shared/components/PageHeader";
import DataTableServer, { DataColumn } from "@/modules/shared/components/DataTableServer";
import StatusBadge from "@/modules/shared/components/StatusBadge";
import EmptyState from "@/modules/shared/components/EmptyState";
import {
  usePricingTemplate,
  usePricingTemplateUsages,
} from "@/modules/pricing/hooks/usePricingTemplates";
import type { PricingTemplateUsageDto } from "@/shared/types/productOperations.types";

const PricingTemplateDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const { data: template, isLoading } = usePricingTemplate(id);
  const { data: usages = [], isLoading: usagesLoading } = usePricingTemplateUsages(id);

  const outdatedCount = useMemo(() => usages.filter((usage) => usage.isOutdated).length, [usages]);

  const columns: DataColumn<PricingTemplateUsageDto>[] = useMemo(
    () => [
      {
        key: "product",
        title: "Ürün",
        render: (it) => (
          <Link to={`/products/${it.productId}`} className="fw-medium">
            {it.productName}
          </Link>
        ),
      },
      { key: "rule", title: "Kural", render: (it) => it.pricingRuleName },
      { key: "code", title: "Kural Kodu", render: (it) => <span className="text-soft">{it.pricingRuleCode}</span> },
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

  if (isLoading) {
    return (
      <Content>
        <div className="text-center py-5">Yükleniyor…</div>
      </Content>
    );
  }

  if (!template) {
    return (
      <Content>
        <EmptyState
          icon="alert-circle"
          title="Şablon bulunamadı"
          description="Bu fiyat şablonu silinmiş olabilir."
          action={
            <Button color="light" onClick={() => navigate("/pricing/templates")}>
              Listeye Dön
            </Button>
          }
        />
      </Content>
    );
  }

  return (
    <>
      <Head title={`Şablon: ${template.name}`} />
      <Content>
        <PageHeader
          title={template.name}
          description={`${template.code} · v${template.version}${
            template.unitDefinitionName ? ` · ${template.unitDefinitionName}` : ""
          }`}
          actions={
            <>
              <Button color="light" className="me-2" onClick={() => navigate("/pricing/templates")}>
                <Icon name="arrow-left" className="me-1" />
                Listeye Dön
              </Button>
              <Button color="primary" onClick={() => navigate(`/pricing/templates/${template.id}/edit`)}>
                <Icon name="edit" className="me-1" />
                Düzenle
              </Button>
            </>
          }
        />

        {outdatedCount > 0 && (
          <Block>
            <div className="alert alert-warning">
              <Icon name="alert-circle" className="me-1" />
              {outdatedCount} kural şablonun güncel sürümünün gerisinde. Şablon kopyalanarak
              uygulandığı için sonradan yapılan değişiklikler ürünlere otomatik yansımaz.
              Bu kuralları toplu güncellemek için bir zam revizyonu oluşturup kapsamını bu
              şablon olarak seçebilirsiniz.
            </div>
          </Block>
        )}

        <Block>
          <div className="card card-bordered">
            <div className="card-inner">
              <h6 className="title mb-2">Fiyat Gövdesi</h6>
              <pre className="bg-lighter p-3 rounded small mb-0" style={{ overflowX: "auto" }}>
                {JSON.stringify(JSON.parse(template.payloadJson || "{}"), null, 2)}
              </pre>
            </div>
          </div>
        </Block>

        <Block>
          <h6 className="title mb-2">Bu şablonu kullanan kurallar</h6>
          <DataTableServer
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
        </Block>
      </Content>
    </>
  );
};

export default PricingTemplateDetailPage;
