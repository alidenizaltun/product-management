import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "reactstrap";
import Content from "@/layout/content/Content";
import Head from "@/layout/head/Head";
import Icon from "@/components/icon/Icon";
import { Block } from "@/components/Component";
import PageHeader from "@/modules/shared/components/PageHeader";
import { ProfileCard } from "@/modules/shared/components/ProfileCard";
import { DetailSection } from "@/modules/shared/components/DetailSection";
import ConfirmDialog from "@/modules/shared/components/ConfirmDialog";
import StatusBadge from "@/modules/shared/components/StatusBadge";
import { usePermission } from "@/modules/shared/hooks/usePermission";
import { showApiError, showSuccess } from "@/modules/shared/components/NotificationAlert";
import { useUser, useUserMutations } from "@/modules/identity/hooks/useUsers";

const UserDetailPage: React.FC = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const canManage = usePermission("Users.Manage");
    const [pendingDeactivate, setPendingDeactivate] = useState(false);

    const { data: user, isLoading } = useUser(id);
    const { deactivate, resendInvitation } = useUserMutations();

    if (isLoading || !user) {
        return (
            <>
                <Head title="Kullanıcı Detayı" />
                <Content>
                    <PageHeader title="Kullanıcı Detayı" />
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
            <Head title={user.fullName || user.email} />
            <Content>
                <PageHeader
                    title={user.fullName || user.email}
                    description={user.email}
                    actions={
                        canManage ? (
                            <div className="d-flex gap-2">
                                <Button color="light" onClick={() => navigate(`/identity/users/${id}/edit`)}>
                                    <Icon name="edit" id="" className="me-1" style={{}} />
                                    Düzenle
                                </Button>
                                {user.isActive && (
                                    <Button color="danger" outline onClick={() => setPendingDeactivate(true)}>
                                        <Icon name="user-cross" id="" className="me-1" style={{}} />
                                        Pasifleştir
                                    </Button>
                                )}
                            </div>
                        ) : undefined
                    }
                />
                <div className="row g-gs">
                    <div className="col-lg-4">
                        <ProfileCard
                            name={user.fullName || user.email}
                            role={user.roles.join(", ") || "Rol atanmamış"}
                            email={user.email}
                            phone={user.phoneNumber}
                            actions={
                                canManage && !user.emailConfirmed ? (
                                    <Button
                                        color="light"
                                        size="sm"
                                        onClick={async () => {
                                            try {
                                                await resendInvitation.mutateAsync(user.id);
                                                showSuccess("Davet e-postası yeniden gönderildi.");
                                            } catch (err) {
                                                showApiError(err);
                                            }
                                        }}
                                    >
                                        <Icon name="send" id="" className="me-1" style={{}} />
                                        Daveti Yeniden Gönder
                                    </Button>
                                ) : undefined
                            }
                        />
                    </div>
                    <div className="col-lg-8">
                        <div className="card card-bordered">
                            <div className="card-inner">
                                <DetailSection
                                    title="Hesap Bilgileri"
                                    icon="user"
                                    items={[
                                        { label: "Durum", value: <StatusBadge active={user.isActive} /> },
                                        {
                                            label: "E-posta Onayı",
                                            value: user.emailConfirmed ? "Onaylı" : "Onay bekliyor",
                                        },
                                        {
                                            label: "Roller",
                                            value: user.roles.length ? user.roles.join(", ") : "—",
                                        },
                                        {
                                            label: "Oluşturulma Tarihi",
                                            value: new Date(user.createdAt).toLocaleString("tr-TR"),
                                        },
                                        {
                                            label: "Son Güncelleme",
                                            value: user.updatedAt ? new Date(user.updatedAt).toLocaleString("tr-TR") : "—",
                                        },
                                    ]}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </Content>

            <ConfirmDialog
                open={pendingDeactivate}
                title="Kullanıcı Pasifleştirilsin mi?"
                message={`"${user.fullName || user.email}" adlı kullanıcı sisteme giriş yapamayacak.`}
                variant="danger"
                loading={deactivate.isPending}
                onCancel={() => setPendingDeactivate(false)}
                onConfirm={async () => {
                    try {
                        await deactivate.mutateAsync(user.id);
                        showSuccess("Kullanıcı pasifleştirildi.");
                    } catch (err) {
                        showApiError(err);
                    } finally {
                        setPendingDeactivate(false);
                    }
                }}
            />
        </>
    );
};

export default UserDetailPage;
