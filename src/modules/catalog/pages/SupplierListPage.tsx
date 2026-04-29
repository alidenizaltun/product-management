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
import { ProductSupplierDto } from "@/domain";
import { useSuppliers, useSupplierMutations } from "@/modules/catalog/hooks/useCatalog";

const PAGE_SIZE = 10;

const SupplierListPage: React.FC = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [pendingDelete, setPendingDelete] = useState<ProductSupplierDto | null>(null);

  const { data: suppliers = [], isLoading } = useSuppliers();
  const { remove } = useSupplierMutations();

  const paginated = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return suppliers.slice(start, start + PAGE_SIZE);
  }, [suppliers, page]);

  const columns: DataColumn<ProductSupplierDto>[] = useMemo(
    () => [
      { key: "code", title: "Kod", render: (it) => <span className="fw-medium">{it.supplierCode}</span> },
      { key: "name", title: "Ad", render: (it) => it.name },
      { key: "email", title: "E-posta", render: (it) => <span className="text-soft">{it.email || "—"}</span> },
      { key: "phone", title: "Telefon", render: (it) => <span className="text-soft">{it.phone || "—"}</span> },
      { key: "status", title: "Durum", render: (it) => <StatusBadge active={it.isActive} /> },
      {
        key: "actions",
        title: "İşlemler",
        className: "nk-tb-col-tools",
        render: (it) => (
          <ul className="nk-tb-actions gx-1 justify-content-end">
            <li>
              <Link to={`/catalog/suppliers/${it.id}`} className="btn btn-icon btn-trigger" title="Detay">
                <Icon name="eye" />
              </Link>
            </li>
            <li>
              <Link to={`/catalog/suppliers/${it.id}/edit`} className="btn btn-icon btn-trigger" title="Düzenle">
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
      <Head title="Tedarikçiler" />
      <Content>
        <PageHeader
          title="Tedarikçiler"
          description="Tedarikçi bilgilerini yönetin."
          actions={
            <Button color="primary" onClick={() => navigate("/catalog/suppliers/new")}>
              <Icon name="plus" className="me-1" />
              Yeni Tedarikçi
            </Button>
          }
        />
        <Block>
          <DataTableServer
            columns={columns}
            items={paginated}
            page={page}
            pageSize={PAGE_SIZE}
            totalItems={suppliers.length}
            onPageChange={setPage}
            isLoading={isLoading}
            emptyTitle="Henüz tedarikçi yok"
            emptyIcon="building"
            rowKey={(it) => it.id}
            emptyAction={
              <Button color="primary" onClick={() => navigate("/catalog/suppliers/new")}>
                <Icon name="plus" className="me-1" />
                Yeni Tedarikçi
              </Button>
            }
          />
        </Block>
      </Content>

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title="Tedarikçi Silinsin mi?"
        message={`"${pendingDelete?.name}" tedarikçisi kalıcı olarak silinecek.`}
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

export default SupplierListPage;
