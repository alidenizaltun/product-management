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
import { ProductDto } from "@/domain";
import { useProducts } from "@/modules/products/hooks/useProducts";
import { useProductMutations } from "@/modules/products/hooks/useProductMutations";

const PAGE_SIZE = 10;

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
  3: { label: "Arşiv", color: "danger" },
};

const ProductListPage: React.FC = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [pendingDelete, setPendingDelete] = useState<ProductDto | null>(null);

  const { data, isLoading } = useProducts({ page, pageSize: PAGE_SIZE, search });
  const { deleteMutation } = useProductMutations();

  const columns: DataColumn<ProductDto>[] = useMemo(
    () => [
      {
        key: "code",
        title: "Kod",
        render: (it) => <span className="fw-medium">{it.productCode}</span>,
      },
      {
        key: "name",
        title: "Ad",
        render: (it) => (
          <Link to={`/products/${it.id}`} className="text-reset fw-medium">
            {it.name}
          </Link>
        ),
      },
      {
        key: "kind",
        title: "Tür",
        render: (it) => {
          const k = KIND_LABELS[it.kind];
          return k ? <span className={`badge badge-dim bg-${k.color}`}>{k.label}</span> : it.kind;
        },
      },
      {
        key: "brand",
        title: "Marka",
        render: (it) => <span className="text-soft">{it.brand || "—"}</span>,
      },
      {
        key: "status",
        title: "Durum",
        render: (it) => {
          const s = STATUS_LABELS[it.status];
          return (
            <div className="d-flex gap-1">
              {s ? <span className={`badge badge-dim bg-${s.color}`}>{s.label}</span> : null}
              <StatusBadge active={it.isActive} />
            </div>
          );
        },
      },
      {
        key: "actions",
        title: "İşlemler",
        className: "nk-tb-col-tools",
        render: (it) => (
          <ul className="nk-tb-actions gx-1 justify-content-end">
            <li>
              <Link to={`/products/${it.id}`} className="btn btn-icon btn-trigger" title="Detay">
                <Icon name="eye" />
              </Link>
            </li>
            <li>
              <Link to={`/products/${it.id}/edit`} className="btn btn-icon btn-trigger" title="Düzenle">
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
      <Head title="Ürünler" />
      <Content>
        <PageHeader
          title="Ürünler"
          description="Ürün katalogunuzu yönetin."
          actions={
            <Button color="primary" onClick={() => navigate("/products/new")}>
              <Icon name="plus" className="me-1" />
              Yeni Ürün
            </Button>
          }
        />
        <Block>
          <DataTableServer
            columns={columns}
            items={data?.items ?? []}
            page={page}
            pageSize={PAGE_SIZE}
            totalItems={data?.totalCount ?? 0}
            onPageChange={setPage}
            isLoading={isLoading}
            emptyTitle="Henüz ürün yok"
            emptyDescription="Katalogunuza ilk ürünü ekleyin."
            emptyIcon="box"
            rowKey={(it) => it.id}
            emptyAction={
              <Button color="primary" onClick={() => navigate("/products/new")}>
                <Icon name="plus" className="me-1" />
                Yeni Ürün
              </Button>
            }
            toolbar={
              <div className="form-inline flex-nowrap gap-2" style={{ minWidth: 240 }}>
                <div className="form-control-wrap" style={{ flex: 1 }}>
                  <div className="form-icon form-icon-left">
                    <Icon name="search" />
                  </div>
                  <input
                    type="text"
                    className="form-control ps-4"
                    placeholder="Ürün ara..."
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value);
                      setPage(1);
                    }}
                  />
                </div>
              </div>
            }
          />
        </Block>
      </Content>

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title="Ürün Silinsin mi?"
        message={`"${pendingDelete?.name}" ürünü kalıcı olarak silinecek. Bu işlem geri alınamaz.`}
        variant="danger"
        loading={deleteMutation.isPending}
        onCancel={() => setPendingDelete(null)}
        onConfirm={async () => {
          if (!pendingDelete) return;
          await deleteMutation.mutateAsync(pendingDelete.id);
          setPendingDelete(null);
        }}
      />
    </>
  );
};

export default ProductListPage;
