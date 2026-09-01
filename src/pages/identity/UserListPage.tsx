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
import { SearchInput } from "@/components/shared/FilterBar";
import { usePermission } from "@/application/hooks/usePermission";
import { showApiError, showSuccess } from "@/components/shared/NotificationAlert";
import type { AdminUser } from "@/domain/types/identity.types";
import { useUsers, useUserMutations } from "@/application/hooks/useUsers";

const PAGE_SIZE = 10;

const UserListPage: React.FC = () => {
    const navigate = useNavigate();
    const canManage = usePermission("Users.Manage");
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [pendingDeactivate, setPendingDeactivate] = useState<AdminUser | null>(null);

    const { data: items = [], isLoading } = useUsers(search, true);
    const { deactivate, resendInvitation } = useUserMutations();

    const paginated = useMemo(() => {
        const start = (page - 1) * PAGE_SIZE;
        return items.slice(start, start + PAGE_SIZE);
    }, [items, page]);

    const columns: DataColumn<AdminUser>[] = useMemo(
        () => [
            {
                key: "fullName",
                title: "Ad Soyad",
                render: (it) => <span className="fw-medium">{it.fullName || "—"}</span>,
            },
            { key: "email", title: "E-posta", render: (it) => it.email },
            {
                key: "roles",
                title: "Roller",
                render: (it) => (
                    <div className="d-flex flex-wrap gap-1">
                        {it.roles.length === 0 && <span className="text-soft">—</span>}
                        {it.roles.map((r) => (
                            <span key={r} className="badge badge-dim bg-primary">
                                {r}
                            </span>
                        ))}
                    </div>
                ),
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
                            <Link to={`/identity/users/${it.id}`} className="btn btn-icon btn-trigger" title="Detay">
                                <Icon name="eye" id="" className="" style={{}} />
                            </Link>
                        </li>
                        {canManage && (
                            <>
                                <li>
                                    <Link
                                        to={`/identity/users/${it.id}/edit`}
                                        className="btn btn-icon btn-trigger"
                                        title="Düzenle"
                                    >
                                        <Icon name="edit" id="" className="" style={{}} />
                                    </Link>
                                </li>
                                {!it.emailConfirmed && (
                                    <li>
                                        <button
                                            type="button"
                                            className="btn btn-icon btn-trigger"
                                            title="Daveti Yeniden Gönder"
                                            onClick={async () => {
                                                try {
                                                    await resendInvitation.mutateAsync(it.id);
                                                    showSuccess("Davet e-postası yeniden gönderildi.");
                                                } catch (err) {
                                                    showApiError(err);
                                                }
                                            }}
                                        >
                                            <Icon name="send" id="" className="" style={{}} />
                                        </button>
                                    </li>
                                )}
                                {it.isActive && (
                                    <li>
                                        <button
                                            type="button"
                                            className="btn btn-icon btn-trigger text-danger"
                                            title="Pasifleştir"
                                            onClick={() => setPendingDeactivate(it)}
                                        >
                                            <Icon name="user-cross" id="" className="" style={{}} />
                                        </button>
                                    </li>
                                )}
                            </>
                        )}
                    </ul>
                ),
            },
        ],
        [canManage, resendInvitation]
    );

    return (
        <>
            <Head title="Kullanıcılar" />
            <Content>
                <PageHeader
                    title="Kullanıcılar"
                    description="Sistem kullanıcı hesaplarını ve rollerini yönetin."
                    actions={
                        canManage ? (
                            <Button color="primary" onClick={() => navigate("/identity/users/new")}>
                                <Icon name="plus" id="" className="me-1" style={{}} />
                                Yeni Kullanıcı
                            </Button>
                        ) : undefined
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
                        emptyTitle="Henüz kullanıcı yok"
                        emptyIcon="users"
                        rowKey={(it) => it.id}
                        toolbar={
                            <SearchInput value={search} onChange={setSearch} placeholder="Ad, soyad veya e-posta ara..." />
                        }
                    />
                </Block>
            </Content>

            <ConfirmDialog
                open={Boolean(pendingDeactivate)}
                title="Kullanıcı Pasifleştirilsin mi?"
                message={`"${pendingDeactivate?.fullName || pendingDeactivate?.email}" adlı kullanıcı sisteme giriş yapamayacak.`}
                variant="danger"
                loading={deactivate.isPending}
                onCancel={() => setPendingDeactivate(null)}
                onConfirm={async () => {
                    if (!pendingDeactivate) return;
                    try {
                        await deactivate.mutateAsync(pendingDeactivate.id);
                        showSuccess("Kullanıcı pasifleştirildi.");
                    } catch (err) {
                        showApiError(err);
                    } finally {
                        setPendingDeactivate(null);
                    }
                }}
            />
        </>
    );
};

export default UserListPage;
