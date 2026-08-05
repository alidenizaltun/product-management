import React, { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "reactstrap";
import Content from "@/layout/content/Content";
import Head from "@/layout/head/Head";
import Icon from "@/components/icon/Icon";
import { Block } from "@/components/Component";
import PageHeader from "@/modules/shared/components/PageHeader";
import { DetailSection } from "@/modules/shared/components/DetailSection";
import StatusBadge from "@/modules/shared/components/StatusBadge";
import ConfirmDialog from "@/modules/shared/components/ConfirmDialog";
import { usePermission } from "@/modules/shared/hooks/usePermission";
import { showApiError, showSuccess } from "@/modules/shared/components/NotificationAlert";
import { useRole, useRoleMutations, usePermissionCatalog } from "@/modules/identity/hooks/useRoles";

const RoleDetailPage: React.FC = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const canManage = usePermission("Roles.Manage");
    const [pendingDelete, setPendingDelete] = useState(false);

    const { data: role, isLoading } = useRole(id);
    const { data: catalog = [] } = usePermissionCatalog();
    const { remove } = useRoleMutations();

    const permissionLabels = useMemo(() => {
        if (!role) return [];
        return catalog.filter((p) => role.permissions.includes(p.key));
    }, [role, catalog]);

    if (isLoading || !role) {
        return (
            <>
                <Head title="Rol Detayı" />
                <Content>
                    <PageHeader title="Rol Detayı" />
                    <Block className="" size="">
                        <div className="card card-bordered">
                            <div className="card-inner d-flex align-items-center gap-2">
                                <span className="spinner-border spinner-border-sm text-primary" />
                                <span>Yükleniyor...</span>
                            </div>
                        </div>
                    </Block>
                </Content>
            </>
        );
    }

    return (
        <>
            <Head title={role.name} />
            <Content>
                <PageHeader
                    title={role.name}
                    description={role.description}
                    actions={
                        canManage ? (
                            <div className="d-flex gap-2">
                                <Button color="light" onClick={() => navigate(`/identity/roles/${id}/edit`)}>
                                    <Icon name="edit" id="" className="me-1" style={{}} />
                                    Düzenle
                                </Button>
                                <Button color="danger" outline onClick={() => setPendingDelete(true)}>
                                    <Icon name="trash" id="" className="me-1" style={{}} />
                                    Sil
                                </Button>
                            </div>
                        ) : undefined
                    }
                />
                <div className="row g-gs">
                    <div className="col-lg-5">
                        <div className="card card-bordered">
                            <div className="card-inner">
                                <DetailSection
                                    title="Rol Bilgileri"
                                    icon="shield-star"
                                    items={[
                                        { label: "Durum", value: <StatusBadge active={role.isActive} /> },
                                        { label: "Kullanıcı Sayısı", value: role.userCount },
                                        {
                                            label: "Oluşturulma Tarihi",
                                            value: new Date(role.createdAt).toLocaleString("tr-TR"),
                                        },
                                    ]}
                                />
                            </div>
                        </div>
                    </div>
                    <div className="col-lg-7">
                        <div className="card card-bordered">
                            <div className="card-inner">
                                <h6 className="overline-title text-primary-dim mb-3">İzinler ({permissionLabels.length})</h6>
                                {permissionLabels.length === 0 ? (
                                    <span className="text-soft">Bu role henüz izin atanmadı.</span>
                                ) : (
                                    <div className="d-flex flex-wrap gap-2">
                                        {permissionLabels.map((p) => (
                                            <span key={p.key} className="badge badge-dim bg-primary">
                                                {p.displayName}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </Content>

            <ConfirmDialog
                open={pendingDelete}
                title="Rol Silinsin mi?"
                message={`"${role.name}" rolü kalıcı olarak silinecek.`}
                variant="danger"
                loading={remove.isPending}
                onCancel={() => setPendingDelete(false)}
                onConfirm={async () => {
                    try {
                        await remove.mutateAsync(role.id);
                        showSuccess("Rol silindi.");
                        navigate("/identity/roles");
                    } catch (err) {
                        showApiError(err);
                        setPendingDelete(false);
                    }
                }}
            />
        </>
    );
};

export default RoleDetailPage;
