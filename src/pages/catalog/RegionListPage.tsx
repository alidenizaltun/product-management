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
import { RegionDto } from "@/domain/types/productOperations.types";
import { useRegions, useRegionMutations } from "@/application/hooks/useRegions";

const PAGE_SIZE = 10;

const RegionListPage: React.FC = () => {
    const navigate = useNavigate();
    const [page, setPage] = useState(1);
    const [pendingDelete, setPendingDelete] = useState<RegionDto | null>(null);

    const { data: items = [], isLoading } = useRegions(true);
    const { remove } = useRegionMutations();

    const paginated = useMemo(() => {
        const start = (page - 1) * PAGE_SIZE;
        return items.slice(start, start + PAGE_SIZE);
    }, [items, page]);

    const columns: DataColumn<RegionDto>[] = useMemo(
        () => [
            {
                key: "code",
                title: "Kod",
                render: (it) => <span className="fw-medium text-monospace">{it.code}</span>,
            },
            { key: "name", title: "Ad", render: (it) => it.name },
            {
                key: "description",
                title: "Açıklama",
                render: (it) => <span className="text-soft">{it.description || "—"}</span>,
            },
            {
                key: "sortOrder",
                title: "Sıra",
                render: (it) => <span className="text-soft">{it.sortOrder}</span>,
            },
            {
                key: "status",
                title: "Durum",
                render: (it) => <StatusBadge active={it.isActive} />,
            },
            {
                key: "actions",
                title: "İşlemler",
                className: "nk-tb-col-tools",
                render: (it) => (
                    <ul className="nk-tb-actions gx-1 justify-content-end">
                        <li>
                            <Link
                                to={`/definitions/regions/${it.id}/edit`}
                                className="btn btn-icon btn-trigger"
                                title="Düzenle"
                            >
                                <Icon name="edit" id="" className="" style={{}} />
                            </Link>
                        </li>
                        <li>
                            <button
                                type="button"
                                className="btn btn-icon btn-trigger text-danger"
                                title="Sil"
                                onClick={() => setPendingDelete(it)}
                            >
                                <Icon name="trash" id="" className="" style={{}} />
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
            <Head title="Bölge Tanımları" />
            <Content>
                <PageHeader
                    title="Bölge Tanımları"
                    description="Satış bölgelerini (Türkiye, Almanya, Marmara vb.) tanımlayın. Ürünler bu bölgelere bağlanır; para birimi ve KDV oranı ürün bazında bölgeye göre belirlenir."
                    actions={
                        <Button color="primary" onClick={() => navigate("/definitions/regions/new")}>
                            <Icon name="plus" id="" className="me-1" style={{}} />
                            Yeni Bölge
                        </Button>
                    }
                />
                <Block className="" size="">
                    <DataTableServer
                        columns={columns}
                        items={paginated}
                        page={page}
                        pageSize={PAGE_SIZE}
                        totalItems={items.length}
                        onPageChange={setPage}
                        isLoading={isLoading}
                        emptyTitle="Henüz bölge tanımı yok"
                        emptyIcon="map-pin"
                        rowKey={(it) => it.id}
                        emptyAction={
                            <Button color="primary" onClick={() => navigate("/definitions/regions/new")}>
                                <Icon name="plus" id="" className="me-1" style={{}} />
                                Yeni Bölge
                            </Button>
                        }
                    />
                </Block>
            </Content>

            <ConfirmDialog
                open={Boolean(pendingDelete)}
                title="Bölge Kaydı Silinsin mi?"
                message={`"${pendingDelete?.name}" bölgesi kalıcı olarak silinecek. Bu bölgeye bağlı ürün varsa silme işlemi başarısız olur.`}
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

export default RegionListPage;
