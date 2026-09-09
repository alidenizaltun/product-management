import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "reactstrap";
import Icon from "@/components/icon/Icon";
import {
  ConfirmDialog,
  DetailCard,
  DetailPage,
  DetailSection,
  EMPTY_DETAIL_VALUE,
  ProfileCard,
  StatusBadge,
  formatDetailDate,
} from "@/components/shared";
import { usePermission } from "@/application/hooks/usePermission";
import { showApiError, showSuccess } from "@/components/shared/NotificationAlert";
import { useUser, useUserMutations } from "@/application/hooks/useUsers";

const UserDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const canManage = usePermission("Users.Manage");
  const [pendingDeactivate, setPendingDeactivate] = useState(false);

  const { data: user, isLoading, refetch } = useUser(id);
  const { deactivate, resendInvitation } = useUserMutations();
  const missing = !isLoading && !user;

  return (
    <>
      <DetailPage
        title={user?.fullName || user?.email || "Kullanıcı Detayı"}
        subtitle={user?.email}
        breadcrumbs={[
          { label: "Kullanıcılar", to: "/identity/users" },
          { label: user?.fullName || user?.email || "Detay" },
        ]}
        loading={isLoading}
        error={missing}
        errorMessage="Kullanıcı bulunamadı veya yüklenirken bir hata oluştu."
        onRetry={() => {
          void refetch();
        }}
        backTo="/identity/users"
        headerActions={
          canManage && user ? (
            <div className="d-flex gap-2">
              <Button color="primary" size="sm" onClick={() => navigate(`/identity/users/${id}/edit`)}>
                <Icon name="edit" className="me-1" />
                Düzenle
              </Button>
              {user.isActive && (
                <Button color="danger" outline size="sm" onClick={() => setPendingDeactivate(true)}>
                  <Icon name="user-cross" className="me-1" />
                  Pasifleştir
                </Button>
              )}
            </div>
          ) : undefined
        }
      >
        {user ? (
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
                      <Icon name="send" className="me-1" />
                      Daveti Yeniden Gönder
                    </Button>
                  ) : undefined
                }
              />
            </div>
            <div className="col-lg-8">
              <DetailCard title="Hesap Bilgileri" icon="user" fullHeight={false}>
                <DetailSection
                  items={[
                    { label: "Durum", value: <StatusBadge active={user.isActive} /> },
                    {
                      label: "E-posta Onayı",
                      value: user.emailConfirmed ? "Onaylı" : "Onay bekliyor",
                    },
                    {
                      label: "Roller",
                      value: user.roles.length ? user.roles.join(", ") : EMPTY_DETAIL_VALUE,
                    },
                    { label: "Oluşturulma Tarihi", value: formatDetailDate(user.createdAt) },
                    { label: "Son Güncelleme", value: formatDetailDate(user.updatedAt) },
                  ]}
                />
              </DetailCard>
            </div>
          </div>
        ) : null}
      </DetailPage>

      {user ? (
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
      ) : null}
    </>
  );
};

export default UserDetailPage;
