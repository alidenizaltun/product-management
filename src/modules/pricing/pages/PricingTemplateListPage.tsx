import React, { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "reactstrap";
import Content from "@/layout/content/Content";
import Head from "@/layout/head/Head";
import Icon from "@/components/icon/Icon";
import { Block } from "@/components/Component";
import PageHeader from "@/modules/shared/components/PageHeader";
import DataTableServer, { DataColumn } from "@/modules/shared/components/DataTableServer";
import StatusBadge from "@/modules/shared/components/StatusBadge";
import ConfirmDialog from "@/modules/shared/components/ConfirmDialog";
import { showApiError, showSuccess } from "@/modules/shared/components/NotificationAlert";
import type { PricingTemplateDto } from "@/shared/types/productOperations.types";
import {
  usePricingTemplateMutations,
  usePricingTemplates,
} from "@/modules/pricing/hooks/usePricingTemplates";

const PAGE_SIZE = 10;

const PricingTemplateListPage: React.FC = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [pendingDelete, setPendingDelete] = useState<PricingTemplateDto | null>(null);

  const { data: templates = [], isLoading } = usePricingTemplates({ includeInactive: true });
  const { remove } = usePricingTemplateMutations();

  const paginated = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return templates.slice(start, start + PAGE_SIZE);
  }, [templates, page]);

  const columns: DataColumn<PricingTemplateDto>[] = useMemo(
    () => [
      { key: "code", title: "Kod", render: (it) => <span className="fw-medium">{it.code}</span> },
      { key: "name", title: "Ad", render: (it) => it.name },
      {
        key: "unit",
        title: "Birim",
        render: (it) => <span className="text-soft">{it.unitDefinitionName || "—"}</span>,
      },
      {
        key: "version",
        title: "Sürüm",
        render: (it) => <span className="badge bg-outline-light text-dark">v{it.version}</span>,
      },
      {
        key: "usage",
        title: "Kullanım",
        render: (it) =>
          it.usageCount > 0 ? (
            <Link to={`/pricing/templates/${it.id}`} className="link">
              {it.usageCount} üründe
            </Link>
          ) : (
            <span className="text-soft">Kullanılmıyor</span>
          ),
      },
      { key: "status", title: "Durum", render: (it) => <StatusBadge active={it.isActive} /> },
      {
        key: "actions",
        title: "İşlemler",
        className: "nk-tb-col-tools",
        render: (it) => (
          <ul className="nk-tb-actions gx-1 justify-content-end">
            <li>
              <Link to={`/pricing/templates/${it.id}`} className="btn btn-icon btn-trigger" title="Kullanımlar">
                <Icon name="eye" />
              </Link>
            </li>
            <li>
              <Link to={`/pricing/templates/${it.id}/edit`} className="btn btn-icon btn-trigger" title="Düzenle">
                <Icon name="edit" />
              </Link>
            </li>
            <li>
              <button
                type="button"
                className="btn btn-icon btn-trigger text-danger"
                title="Sil"
                onClick={() => setPendingDelete(it)}
              >
                <Icon name="trash" />
              </button>
            </li>
          </ul>
        ),
      },
    ],
    []
  );

  return (
    <>
      <Head title="Fiyat Şablonları" />
      <Content>
        <PageHeader
          title="Fiyat Şablonları"
          description="Bir kez kurulan fiyatlandırmayı saklayın, başka ürünlere tek tıkla uygulayın."
          actions={
            <Button color="primary" onClick={() => navigate("/pricing/templates/new")}>
              <Icon name="plus" className="me-1" />
              Yeni Şablon
            </Button>
          }
        />
        <Block>
          <DataTableServer
            columns={columns}
            items={paginated}
            page={page}
            pageSize={PAGE_SIZE}
            totalItems={templates.length}
            onPageChange={setPage}
            isLoading={isLoading}
            emptyTitle="Henüz fiyat şablonu yok"
            emptyIcon="tag"
            rowKey={(it) => it.id}
            emptyAction={
              <Button color="primary" onClick={() => navigate("/pricing/templates/new")}>
                <Icon name="plus" className="me-1" />
                Yeni Şablon
              </Button>
            }
          />
        </Block>
      </Content>

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title="Şablon Silinsin mi?"
        message={
          pendingDelete?.usageCount
            ? `"${pendingDelete.name}" şablonu ${pendingDelete.usageCount} üründe kullanılıyor. Şablon silinse de ürünlerdeki kurallar kalır, yalnızca kaynak bağı kopar.`
            : `"${pendingDelete?.name}" şablonu silinecek.`
        }
        variant="danger"
        loading={remove.isPending}
        onCancel={() => setPendingDelete(null)}
        onConfirm={async () => {
          if (!pendingDelete) return;
          try {
            await remove.mutateAsync(pendingDelete.id);
            showSuccess("Şablon silindi.");
          } catch (error) {
            showApiError(error);
          } finally {
            setPendingDelete(null);
          }
        }}
      />
    </>
  );
};

export default PricingTemplateListPage;
