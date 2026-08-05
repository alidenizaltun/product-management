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
import { usePermission } from "@/modules/shared/hooks/usePermission";
import { showApiError, showSuccess } from "@/modules/shared/components/NotificationAlert";
import type { Role } from "@/shared/types/identity.types";
import { useRoleMutations, useRoles } from "@/modules/identity/hooks/useRoles";

const PAGE_SIZE = 10;

const RoleListPage: React.FC = () => {
    const navigate = useNavigate();
    const canManage = usePermission("Roles.Manage");
    const [page, setPage] = useState(1);
    const [pendingDelete, setPendingDelete] = useState<Role | null>(null);

    const { data: items = [], isLoading } = useRoles();
    const { remove } = useRoleMutations();

    const paginated = useMemo(() => {
        const start = (page - 1) * PAGE_SIZE;
        return items.slice(start, start + PAGE_SIZE);
    }, [items, page]);

    const columns: DataColumn<Role>[] = useMemo(
        () => [
            { key: "name", title: "Ad", render: (it) => <span className="fw-medium">{it.name}</span> },
            {
                key: "description",
                title: "Açıklama",
                render: (it) => <span className="text-soft">{it.description || "—"}</span>,
            },
            {
                key: "userCount",
                title: "Kullanıcı Sayısı",
                render: (it) => it.userCount,
            },
            {
                key: "permissions",
                title: "İzin Sayısı",
                render: (it) => it.permissions.length,
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
                            <Link to={`/identity/roles/${it.id}`} className="btn btn-icon btn-trigger" title="Detay">
                                <Icon name="eye" id="" className="" style={{}} />
                            </Link>
                        </li>
                        {canManage && (
                            <>
                                <li>
                                    <Link
                                        to={`/identity/roles/${it.id}/edit`}
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
                            </>
                        )}
                    </ul>
                ),
            },
        ],
        [canManage]
    );

    return (
        <>
            <Head title="Roller" />
            <Content>
                <PageHeader
                    title="Roller"
                    description="Rolleri ve rollere bağlı izinleri yönetin."
                    actions={
                        <div className="d-flex gap-2">
                            <Button color="light" onClick={() => navigate("/identity/permissions")}>
                                <Icon name="shield-check" id="" className="me-1" style={{}} />
                                Yetki Matrisi
                            </Button>
                            {canManage && (
                                <Button color="primary" onClick={() => navigate("/identity/roles/new")}>
                                    <Icon name="plus" id="" className="me-1" style={{}} />
                                    Yeni Rol
                                </Button>
                            )}
                        </div>
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
                        emptyTitle="Henüz rol yok"
                        emptyIcon="shield-star"
                        rowKey={(it) => it.id}
                    />
                </Block>
            </Content>

            <ConfirmDialog
                open={Boolean(pendingDelete)}
                title="Rol Silinsin mi?"
                message={`"${pendingDelete?.name}" rolü kalıcı olarak silinecek. Bu role atanmış kullanıcı varsa işlem başarısız olur.`}
                variant="danger"
                loading={remove.isPending}
                onCancel={() => setPendingDelete(null)}
                onConfirm={async () => {
                    if (!pendingDelete) return;
                    try {
                        await remove.mutateAsync(pendingDelete.id);
                        showSuccess("Rol silindi.");
                    } catch (err) {
                        showApiError(err);
                    } finally {
                        setPendingDelete(null);
                    }
                }}
            />
        </>
    );
};

export default RoleListPage;
