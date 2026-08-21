import React, { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "reactstrap";
import Content from "@/layout/content/Content";
import Head from "@/layout/head/Head";
import Icon from "@/components/icon/Icon";
import { Block } from "@/components/Component";
import PageHeader from "@/modules/shared/components/PageHeader";
import DataTableServer, { DataColumn } from "@/modules/shared/components/DataTableServer";
import ConfirmDialog from "@/modules/shared/components/ConfirmDialog";
import { showApiError, showSuccess } from "@/modules/shared/components/NotificationAlert";
import type { PriceRevisionDto } from "@/shared/types/productOperations.types";
import {
  usePriceRevisionMutations,
  usePriceRevisions,
} from "@/modules/pricing/hooks/usePriceRevisions";
import { RevisionStatusBadge, describeAdjustment } from "@/modules/pricing/components/revisionDisplay";

const PAGE_SIZE = 10;

const PriceRevisionListPage: React.FC = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [pendingDelete, setPendingDelete] = useState<PriceRevisionDto | null>(null);

  const { data: revisions = [], isLoading } = usePriceRevisions();
  const { remove } = usePriceRevisionMutations();

  const paginated = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return revisions.slice(start, start + PAGE_SIZE);
  }, [revisions, page]);

  const columns: DataColumn<PriceRevisionDto>[] = useMemo(
    () => [
      { key: "code", title: "Kod", render: (it) => <span className="fw-medium">{it.code}</span> },
      {
        key: "name",
        title: "Ad",
        render: (it) => (
          <Link to={`/pricing/revisions/${it.id}`} className="link">
            {it.name}
          </Link>
        ),
      },
      { key: "adjustment", title: "Zam", render: (it) => describeAdjustment(it) },
      {
        key: "scope",
        title: "Kapsam",
        render: (it) => <span className="text-soft">{it.scopes.length} satır</span>,
      },
      {
        key: "lines",
        title: "Etkilenen",
        render: (it) =>
          it.summary?.lineCount ? (
            <span>
              {it.summary.lineCount} fiyat · {it.summary.productCount} ürün
            </span>
          ) : (
            <span className="text-soft">Önizlenmedi</span>
          ),
      },
      { key: "status", title: "Durum", render: (it) => <RevisionStatusBadge status={it.status} /> },
      {
        key: "actions",
        title: "İşlemler",
        className: "nk-tb-col-tools",
        render: (it) => (
          <ul className="nk-tb-actions gx-1 justify-content-end">
            <li>
              <Link to={`/pricing/revisions/${it.id}`} className="btn btn-icon btn-trigger" title="Aç">
                <Icon name="eye" />
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
      <Head title="Zam Yönetimi" />
      <Content>
        <PageHeader
          title="Zam Yönetimi"
          description="Toplu fiyat değişikliklerini önizleyin, onaylatın, uygulayın ve gerektiğinde geri alın."
          actions={
            <Button color="primary" onClick={() => navigate("/pricing/revisions/new")}>
              <Icon name="plus" className="me-1" />
              Yeni Zam
            </Button>
          }
        />
        <Block>
          <DataTableServer
            columns={columns}
            items={paginated}
            page={page}
            pageSize={PAGE_SIZE}
            totalItems={revisions.length}
            onPageChange={setPage}
            isLoading={isLoading}
            emptyTitle="Henüz zam revizyonu yok"
            emptyIcon="growth"
            rowKey={(it) => it.id}
            emptyAction={
              <Button color="primary" onClick={() => navigate("/pricing/revisions/new")}>
                <Icon name="plus" className="me-1" />
                Yeni Zam
              </Button>
            }
          />
        </Block>
      </Content>

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title="Revizyon Silinsin mi?"
        message={`"${pendingDelete?.name}" revizyonu silinecek. Uygulanmış bir revizyon silinemez.`}
        variant="danger"
        loading={remove.isPending}
        onCancel={() => setPendingDelete(null)}
        onConfirm={async () => {
          if (!pendingDelete) return;
          try {
            await remove.mutateAsync(pendingDelete.id);
            showSuccess("Revizyon silindi.");
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

export default PriceRevisionListPage;
