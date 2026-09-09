import React, { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "reactstrap";
import Icon from "@/components/icon/Icon";
import {
  ConfirmDialog,
  DetailCard,
  DetailPage,
  DetailSection,
  StatusBadge,
  formatDetailDate,
} from "@/components/shared";
import { usePermission } from "@/application/hooks/usePermission";
import { showApiError, showSuccess } from "@/components/shared/NotificationAlert";
import { useRole, useRoleMutations, usePermissionCatalog } from "@/application/hooks/useRoles";

const RoleDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const canManage = usePermission("Roles.Manage");
  const [pendingDelete, setPendingDelete] = useState(false);

  const { data: role, isLoading, refetch } = useRole(id);
  const { data: catalog = [] } = usePermissionCatalog();
  const { remove } = useRoleMutations();

  const permissionLabels = useMemo(() => {
    if (!role) return [];
    return catalog.filter((p) => role.permissions.includes(p.key));
  }, [role, catalog]);

  const missing = !isLoading && !role;

  return (
    <>
      <DetailPage
        title={role?.name ?? "Rol Detayı"}
        subtitle={role?.description || undefined}
        breadcrumbs={[
          { label: "Roller", to: "/identity/roles" },
          { label: role?.name ?? "Detay" },
        ]}
        loading={isLoading}
        error={missing}
        errorMessage="Rol bulunamadı veya yüklenirken bir hata oluştu."
        onRetry={() => {
          void refetch();
        }}
        backTo="/identity/roles"
        headerActions={
          canManage && role ? (
            <div className="d-flex gap-2">
              <Button color="primary" size="sm" onClick={() => navigate(`/identity/roles/${id}/edit`)}>
                <Icon name="edit" className="me-1" />
                Düzenle
              </Button>
              <Button color="danger" outline size="sm" onClick={() => setPendingDelete(true)}>
                <Icon name="trash" className="me-1" />
                Sil
              </Button>
            </div>
          ) : undefined
        }
      >
        {role ? (
          <div className="row g-gs">
            <div className="col-lg-5">
              <DetailCard title="Rol Bilgileri" icon="shield-star" fullHeight={false}>
                <DetailSection
                  items={[
                    { label: "Durum", value: <StatusBadge active={role.isActive} /> },
                    { label: "Kullanıcı Sayısı", value: role.userCount },
                    { label: "Oluşturulma Tarihi", value: formatDetailDate(role.createdAt) },
                  ]}
                />
              </DetailCard>
            </div>
            <div className="col-lg-7">
              <DetailCard title={`İzinler (${permissionLabels.length})`} icon="lock" fullHeight={false}>
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
              </DetailCard>
            </div>
          </div>
        ) : null}
      </DetailPage>

      {role ? (
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
      ) : null}
    </>
  );
};

export default RoleDetailPage;
