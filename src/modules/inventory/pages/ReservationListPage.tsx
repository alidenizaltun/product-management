import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Content from "@/layout/content/Content";
import Head from "@/layout/head/Head";
import Icon from "@/components/icon/Icon";
import { Block } from "@/components/Component";
import PageHeader from "@/modules/shared/components/PageHeader";
import DataTableServer, { DataColumn } from "@/modules/shared/components/DataTableServer";
import { InventoryReservationDto } from "@/domain";
import { useInventoryReservations } from "@/modules/inventory/hooks/useInventory";

const PAGE_SIZE = 10;

const STATUS_MAP: Record<number, { label: string; color: string }> = {
  1: { label: "Aktif", color: "info" },
  2: { label: "Tamamlandı", color: "success" },
  3: { label: "İptal", color: "secondary" },
  4: { label: "Süresi Doldu", color: "danger" },
};

const ReservationListPage: React.FC = () => {
  const [page, setPage] = useState(1);
  const { data: reservations = [], isLoading } = useInventoryReservations();

  const paginated = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return reservations.slice(start, start + PAGE_SIZE);
  }, [reservations, page]);

  const columns: DataColumn<InventoryReservationDto>[] = useMemo(
    () => [
      { key: "code", title: "Kod", render: (it) => <span className="fw-medium">{it.reservationCode}</span> },
      {
        key: "product",
        title: "Ürün",
        render: (it) => <span className="fs-13px">{it.productId.slice(0, 8)}</span>,
      },
      { key: "qty", title: "Miktar", render: (it) => <span className="fw-medium">{it.quantity}</span> },
      {
        key: "source",
        title: "Kaynak",
        render: (it) => (
          <span className="text-soft">
            {it.sourceType ? `${it.sourceType}: ${it.sourceId ?? "—"}` : "—"}
          </span>
        ),
      },
      {
        key: "until",
        title: "Bitiş",
        render: (it) => (it.reservedUntil ? new Date(it.reservedUntil).toLocaleString("tr-TR") : "—"),
      },
      {
        key: "status",
        title: "Durum",
        render: (it) => {
          const s = STATUS_MAP[it.status];
          return s ? <span className={`badge badge-dim bg-${s.color}`}>{s.label}</span> : it.status;
        },
      },
      {
        key: "actions",
        title: "İşlemler",
        className: "nk-tb-col-tools",
        render: (it) => (
          <ul className="nk-tb-actions gx-1 justify-content-end">
            <li>
              <Link to={`/inventory/reservations/${it.id}`} className="btn btn-icon btn-trigger" title="Detay">
                <Icon name="eye" />
              </Link>
            </li>
          </ul>
        ),
      },
    ],
    []
  );

  return (
    <>
      <Head title="Rezervasyonlar" />
      <Content>
        <PageHeader
          title="Rezervasyonlar"
          description="Sipariş ve kanal bazlı stok rezervasyonları."
        />
        <Block>
          <DataTableServer
            columns={columns}
            items={paginated}
            page={page}
            pageSize={PAGE_SIZE}
            totalItems={reservations.length}
            onPageChange={setPage}
            isLoading={isLoading}
            emptyTitle="Henüz rezervasyon yok"
            emptyIcon="lock-alt"
            rowKey={(it) => it.id}
          />
        </Block>
      </Content>
    </>
  );
};

export default ReservationListPage;
