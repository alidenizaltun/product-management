import React, { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "reactstrap";
import Content from "@/layout/content/Content";
import Head from "@/layout/head/Head";
import Icon from "@/components/icon/Icon";
import { Block } from "@/components/Component";
import PageHeader from "@/components/shared/PageHeader";
import DataTableServer, { DataColumn } from "@/components/shared/DataTableServer";
import StatusBadge from "@/components/shared/StatusBadge";
import ConfirmDialog from "@/components/shared/ConfirmDialog";
import { ProductPriceListDto } from "@/domain/types/productOperations.types";
import { usePriceLists, usePriceListMutations } from "@/application/hooks/usePricing";

const PAGE_SIZE = 10;

const PriceListListPage: React.FC = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [pendingDelete, setPendingDelete] = useState<ProductPriceListDto | null>(null);

  const { data: priceLists = [], isLoading } = usePriceLists();
  const { remove } = usePriceListMutations();

  const paginated = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return priceLists.slice(start, start + PAGE_SIZE);
  }, [priceLists, page]);

  const columns: DataColumn<ProductPriceListDto>[] = useMemo(
    () => [
      { key: "code", title: "Kod", render: (it) => <span className="fw-medium">{it.code}</span> },
      { key: "name", title: "Ad", render: (it) => it.name },
      {
        key: "channel",
        title: "Satış Kanalı",
        render: (it) => <span className="text-soft">{it.salesChannel || "—"}</span>,
      },
      {
        key: "customer",
        title: "Müşteri Grubu",
        render: (it) => <span className="text-soft">{it.customerGroupCode || "—"}</span>,
      },
      { key: "status", title: "Durum", render: (it) => <StatusBadge active={it.isActive} /> },
      {
        key: "actions",
        title: "İşlemler",
        className: "nk-tb-col-tools",
        render: (it) => (
          <ul className="nk-tb-actions gx-1 justify-content-end">
            <li>
              <Link to={`/pricing/price-lists/${it.id}`} className="btn btn-icon btn-trigger" title="Detay">
                <Icon name="eye" />
              </Link>
            </li>
            <li>
              <Link to={`/pricing/price-lists/${it.id}/edit`} className="btn btn-icon btn-trigger" title="Düzenle">
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
      <Head title="Fiyat Listeleri" />
      <Content>
        <PageHeader
          title="Fiyat Listeleri"
          description="Satış kanalı ve müşteri grubuna göre fiyat listeleri."
          actions={
            <Button color="primary" onClick={() => navigate("/pricing/price-lists/new")}>
              <Icon name="plus" className="me-1" />
              Yeni Fiyat Listesi
            </Button>
          }
        />
        <Block>
          <DataTableServer
            columns={columns}
            items={paginated}
            page={page}
            pageSize={PAGE_SIZE}
            totalItems={priceLists.length}
            onPageChange={setPage}
            isLoading={isLoading}
            emptyTitle="Henüz fiyat listesi yok"
            emptyIcon="coins"
            rowKey={(it) => it.id}
            emptyAction={
              <Button color="primary" onClick={() => navigate("/pricing/price-lists/new")}>
                <Icon name="plus" className="me-1" />
                Yeni Fiyat Listesi
              </Button>
            }
          />
        </Block>
      </Content>

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title="Fiyat Listesi Silinsin mi?"
        message={`"${pendingDelete?.name}" fiyat listesi kalıcı olarak silinecek.`}
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

export default PriceListListPage;
