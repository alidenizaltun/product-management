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
import { UnitDefinitionDto } from "@/shared/types/productOperations.types";
import { useUnitDefinitions, useUnitDefinitionMutations } from "@/modules/catalog/hooks/useUnitDefinitions";

const PAGE_SIZE = 10;

const UnitDefinitionListPage: React.FC = () => {
    const navigate = useNavigate();
    const [page, setPage] = useState(1);
    const [pendingDelete, setPendingDelete] = useState<UnitDefinitionDto | null>(null);

    const { data: items = [], isLoading } = useUnitDefinitions(true);
    const { remove } = useUnitDefinitionMutations();

    const paginated = useMemo(() => {
        const start = (page - 1) * PAGE_SIZE;
        return items.slice(start, start + PAGE_SIZE);
    }, [items, page]);

    const columns: DataColumn<UnitDefinitionDto>[] = useMemo(
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
                                to={`/catalog/unit-definitions/${it.id}/edit`}
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
            <Head title="Birim Tanımları" />
            <Content>
                <PageHeader
                    title="Birim Tanımları"
                    description="Ürün ve fiyatlandırma birimlerini (Adet, Kullanıcı, Lisans vb.) yönetin."
                    actions={
                        <Button color="primary" onClick={() => navigate("/catalog/unit-definitions/new")}>
                            <Icon name="plus" id="" className="me-1" style={{}} />
                            Yeni Birim
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
                        emptyTitle="Henüz birim tanımı yok"
                        emptyIcon="layers"
                        rowKey={(it) => it.id}
                        emptyAction={
                            <Button color="primary" onClick={() => navigate("/catalog/unit-definitions/new")}>
                                <Icon name="plus" id="" className="me-1" style={{}} />
                                Yeni Birim
                            </Button>
                        }
                    />
                </Block>
            </Content>

            <ConfirmDialog
                open={Boolean(pendingDelete)}
                title="Birim Tanımı Silinsin mi?"
                message={`"${pendingDelete?.name}" birimi kalıcı olarak silinecek.`}
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

export default UnitDefinitionListPage;
