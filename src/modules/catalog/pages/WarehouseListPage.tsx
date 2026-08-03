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
import { WarehouseDto } from "@/shared/types/productOperations.types";
import { useWarehouses, useWarehouseMutations } from "@/modules/catalog/hooks/useCatalog";

const PAGE_SIZE = 10;

const WarehouseListPage: React.FC = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [pendingDelete, setPendingDelete] = useState<WarehouseDto | null>(null);

  const { data: warehouses = [], isLoading } = useWarehouses();
  const { remove } = useWarehouseMutations();

  const paginated = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return warehouses.slice(start, start + PAGE_SIZE);
  }, [warehouses, page]);

  const columns: DataColumn<WarehouseDto>[] = useMemo(
    () => [
      { key: "code", title: "Kod", render: (it) => <span className="fw-medium">{it.code}</span> },
      { key: "name", title: "Ad", render: (it) => it.name },
      { key: "city", title: "Şehir", render: (it) => <span className="text-soft">{it.city || "—"}</span> },
      { key: "country", title: "Ülke", render: (it) => <span className="text-soft">{it.country || "—"}</span> },
      { key: "status", title: "Durum", render: (it) => <StatusBadge active={it.isActive} /> },
      {
        key: "actions",
        title: "İşlemler",
        className: "nk-tb-col-tools",
        render: (it) => (
          <ul className="nk-tb-actions gx-1 justify-content-end">
            <li>
              <Link to={`/definitions/warehouses/${it.id}`} className="btn btn-icon btn-trigger" title="Detay">
                <Icon name="eye" />
              </Link>
            </li>
            <li>
              <Link to={`/definitions/warehouses/${it.id}/edit`} className="btn btn-icon btn-trigger" title="Düzenle">
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
      <Head title="Depo Tanımları" />
      <Content>
        <PageHeader
          title="Depo Tanımları"
          description="Depo ve stok lokasyonlarını yönetin."
          actions={
            <Button color="primary" onClick={() => navigate("/definitions/warehouses/new")}>
              <Icon name="plus" className="me-1" />
              Yeni Depo
            </Button>
          }
        />
        <Block>
          <DataTableServer
            columns={columns}
            items={paginated}
            page={page}
            pageSize={PAGE_SIZE}
            totalItems={warehouses.length}
            onPageChange={setPage}
            isLoading={isLoading}
            emptyTitle="Henüz depo yok"
            emptyIcon="archive"
            rowKey={(it) => it.id}
            emptyAction={
              <Button color="primary" onClick={() => navigate("/definitions/warehouses/new")}>
                <Icon name="plus" className="me-1" />
                Yeni Depo
              </Button>
            }
          />
        </Block>
      </Content>

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title="Depo Silinsin mi?"
        message={`"${pendingDelete?.name}" deposu kalıcı olarak silinecek.`}
        variant="danger"
        loading={remove.isPending}
        onCancel={() => setPendingDelete(null)}
        onConfirm={async () => {
          if (!pendingDelete) return;
          await remove.mutateAsync(pendingDelete.id);
          setPendingDelete(null);
        }}
      />
    </>
  );
};

export default WarehouseListPage;
