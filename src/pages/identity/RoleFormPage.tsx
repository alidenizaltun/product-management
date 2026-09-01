import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import Content from "@/layout/content/Content";
import Head from "@/layout/head/Head";
import Icon from "@/components/icon/Icon";
import { Block } from "@/components/Component";
import PageHeader from "@/components/shared/PageHeader";
import { TextInput, Textarea, Checkbox, LoadingButton, UnsavedChangesDialog } from "@/components/shared";
import AppAccordion, { AccordionItem } from "@/components/shared/AppAccordion";
import { useUnsavedChangesGuard } from "@/application/hooks/useUnsavedChangesGuard";
import { useRole, useRoleMutations, usePermissionCatalog } from "@/application/hooks/useRoles";
import { showApiError, showSuccess } from "@/components/shared/NotificationAlert";

interface RoleFormValues {
    name: string;
    description?: string;
    isActive: boolean;
}

const RoleFormPage: React.FC = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEdit = Boolean(id);

    const { data: role, isLoading } = useRole(id);
    const { data: catalog = [] } = usePermissionCatalog();
    const { create, update } = useRoleMutations();
    const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isDirty },
    } = useForm<RoleFormValues>({
        defaultValues: { name: "", description: "", isActive: true },
    });

    useEffect(() => {
        if (role) {
            reset({ name: role.name, description: role.description ?? "", isActive: role.isActive });
            setSelectedPermissions(role.permissions);
        }
    }, [role, reset]);

    const categories = useMemo(() => {
        const map = new Map<string, typeof catalog>();
        catalog.forEach((p) => {
            const list = map.get(p.category) ?? [];
            list.push(p);
            map.set(p.category, list);
        });
        return Array.from(map.entries());
    }, [catalog]);

    const togglePermission = (key: string) => {
        setSelectedPermissions((prev) => (prev.includes(key) ? prev.filter((p) => p !== key) : [...prev, key]));
    };

    const accordionItems: AccordionItem[] = categories.map(([category, permissions]) => ({
        id: category,
        title: category,
        badge: permissions.filter((p) => selectedPermissions.includes(p.key)).length || undefined,
        content: (
            <div className="d-flex flex-column gap-2">
                {permissions.map((p) => (
                    <Checkbox
                        key={p.key}
                        label={p.displayName}
                        checked={selectedPermissions.includes(p.key)}
                        onChange={() => togglePermission(p.key)}
                    />
                ))}
            </div>
        ),
    }));

    const onSubmit = async (values: RoleFormValues) => {
        try {
            if (isEdit && id) {
                await update.mutateAsync({
                    id,
                    payload: {
                        description: values.description || undefined,
                        isActive: values.isActive,
                        permissions: selectedPermissions,
                    },
                });
                showSuccess("Rol güncellendi.");
            } else {
                await create.mutateAsync({
                    name: values.name,
                    description: values.description || undefined,
                    permissions: selectedPermissions,
                });
                showSuccess("Rol oluşturuldu.");
            }
            allowNextNavigation();
            navigate("/identity/roles");
        } catch (err) {
            showApiError(err);
        }
    };

    const isPending = create.isPending || update.isPending;
    const title = isEdit ? "Rol Düzenle" : "Yeni Rol";
    const { blocker, allowNextNavigation } = useUnsavedChangesGuard(isDirty);

    return (
        <>
            <Head title={title} />
            <Content>
                <PageHeader
                    title={title}
                    description="Rol tanımlayın ve bu role hangi izinlerin verileceğini seçin."
                    actions={
                        <div className="d-flex gap-2">
                            <button
                                type="button"
                                className="btn btn-light py-2"
                                onClick={() => navigate("/identity/roles")}
                                disabled={isPending}
                            >
                                İptal
                            </button>
                            <LoadingButton color="primary py-2" type="submit" form="role-form" loading={isPending}>
                                <Icon name="save" id="" className="me-1" style={{}} />
                                Kaydet
                            </LoadingButton>
                        </div>
                    }
                />
                <div className="row g-gs">
                    <div className="col-lg-5">
                        {isEdit && isLoading ? (
                            <div className="card card-bordered">
                                <div className="card-inner d-flex align-items-center gap-2">
                                    <span className="spinner-border spinner-border-sm text-primary" />
                                    <span>Yükleniyor...</span>
                                </div>
                            </div>
                        ) : (
                            <div className="card card-bordered">
                                <div className="card-inner">
                                    <form id="role-form" onSubmit={handleSubmit(onSubmit)} className="row g-3">
                                        <div className="col-12">
                                            <TextInput
                                                label="Rol Adı"
                                                required
                                                disabled={isEdit}
                                                placeholder="Örn: Editor"
                                                error={errors.name?.message}
                                                {...register("name", { required: "Rol adı zorunludur" })}
                                            />
                                        </div>
                                        <div className="col-12">
                                            <Textarea
                                                label="Açıklama"
                                                placeholder="Bu rolün amacını açıklayın..."
                                                {...register("description")}
                                            />
                                        </div>
                                        {isEdit && (
                                            <div className="col-12">
                                                <Checkbox label="Aktif" switchStyle {...register("isActive")} />
                                            </div>
                                        )}
                                    </form>
                                </div>
                            </div>
                        )}
                    </div>
                    <div className="col-lg-7">
                        <Block className="" size="">
                            <div className="card card-bordered">
                                <div className="card-inner">
                                    <h6 className="overline-title text-primary-dim mb-3">Yetki Matrisi</h6>
                                    {accordionItems.length === 0 ? (
                                        <span className="text-soft">İzin kataloğu yükleniyor...</span>
                                    ) : (
                                        <AppAccordion items={accordionItems} allowMultiple defaultOpen={categories.map(([c]) => c)} />
                                    )}
                                </div>
                            </div>
                        </Block>
                    </div>
                </div>
            </Content>

            <UnsavedChangesDialog blocker={blocker} />
        </>
    );
};

export default RoleFormPage;
