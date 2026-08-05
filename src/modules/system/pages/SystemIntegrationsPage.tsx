import React, { useEffect, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { Button } from "reactstrap";
import Content from "@/layout/content/Content";
import Head from "@/layout/head/Head";
import Icon from "@/components/icon/Icon";
import PageHeader from "@/modules/shared/components/PageHeader";
import { CardGrid } from "@/modules/shared/components/DataListCard";
import { FormModal } from "@/modules/shared/components/FormModal";
import { ActionDropdown } from "@/modules/shared/components/ActionDropdown";
import ConfirmDialog from "@/modules/shared/components/ConfirmDialog";
import { TextInput, Textarea, Checkbox } from "@/modules/shared/components";
import JsonFieldEditor from "@/modules/shared/components/JsonFieldEditor";
import { usePermission } from "@/modules/shared/hooks/usePermission";
import { showApiError, showSuccess } from "@/modules/shared/components/NotificationAlert";
import type { Integration } from "@/shared/types/system.types";
import { useIntegrationMutations, useIntegrations } from "@/modules/system/hooks/useIntegrations";

const TYPE_OPTIONS = ["Email", "Sms", "Payment", "Storage", "Webhook", "Other"];
const TYPE_ICON: Record<string, string> = {
    Email: "mail",
    Sms: "chat",
    Payment: "wallet",
    Storage: "server",
    Webhook: "share",
    Other: "puzzle",
};

interface IntegrationFormValues {
    name: string;
    type: string;
    providerKey: string;
    isEnabled: boolean;
    description?: string;
    configJson?: string;
    credentialsJson?: string;
}

const SystemIntegrationsPage: React.FC = () => {
    const canManage = usePermission("Integrations.Manage");
    const { data: integrations = [], isLoading } = useIntegrations();
    const { create, update, remove, test } = useIntegrationMutations();

    const [modalOpen, setModalOpen] = useState(false);
    const [editing, setEditing] = useState<Integration | null>(null);
    const [pendingDelete, setPendingDelete] = useState<Integration | null>(null);

    const methods = useForm<IntegrationFormValues>({
        defaultValues: { name: "", type: "Email", providerKey: "", isEnabled: true, description: "" },
    });
    const { register, handleSubmit, reset } = methods;

    useEffect(() => {
        if (modalOpen) {
            reset(
                editing
                    ? {
                          name: editing.name,
                          type: editing.type,
                          providerKey: editing.providerKey,
                          isEnabled: editing.isEnabled,
                          description: editing.description ?? "",
                          configJson: editing.configJson,
                          credentialsJson: undefined,
                      }
                    : { name: "", type: "Email", providerKey: "", isEnabled: true, description: "" }
            );
        }
    }, [modalOpen, editing, reset]);

    const openCreate = () => {
        setEditing(null);
        setModalOpen(true);
    };

    const openEdit = (integration: Integration) => {
        setEditing(integration);
        setModalOpen(true);
    };

    const onSubmit = async (values: IntegrationFormValues) => {
        let credentials: Record<string, string> | undefined;
        if (values.credentialsJson) {
            try {
                credentials = JSON.parse(values.credentialsJson);
            } catch {
                showApiError({ message: "Kimlik bilgileri geçerli bir JSON değil." });
                return;
            }
        }

        try {
            if (editing) {
                await update.mutateAsync({
                    id: editing.id,
                    payload: {
                        name: values.name,
                        isEnabled: values.isEnabled,
                        configJson: values.configJson,
                        credentials,
                        description: values.description || undefined,
                    },
                });
                showSuccess("Entegrasyon güncellendi.");
            } else {
                await create.mutateAsync({
                    name: values.name,
                    type: values.type,
                    providerKey: values.providerKey,
                    isEnabled: values.isEnabled,
                    configJson: values.configJson,
                    credentials,
                    description: values.description || undefined,
                });
                showSuccess("Entegrasyon oluşturuldu.");
            }
            setModalOpen(false);
        } catch (err) {
            showApiError(err);
        }
    };

    const isPending = create.isPending || update.isPending;

    return (
        <>
            <Head title="Entegrasyonlar" />
            <Content>
                <PageHeader
                    title="Entegrasyonlar"
                    description="Üçüncü parti servis entegrasyonlarını yönetin."
                    actions={
                        canManage ? (
                            <Button color="primary" onClick={openCreate}>
                                <Icon name="plus" id="" className="me-1" style={{}} />
                                Yeni Entegrasyon
                            </Button>
                        ) : undefined
                    }
                />

                <CardGrid
                    loading={isLoading}
                    columns={3}
                    emptyIcon="puzzle"
                    emptyTitle="Henüz entegrasyon yok"
                    emptyAction={
                        canManage ? (
                            <Button color="primary" size="sm" onClick={openCreate}>
                                Yeni Entegrasyon
                            </Button>
                        ) : undefined
                    }
                    items={integrations.map((integration) => ({
                        id: integration.id,
                        title: integration.name,
                        subtitle: integration.providerKey,
                        icon: TYPE_ICON[integration.type] ?? "puzzle",
                        color: integration.isEnabled ? "primary" : "gray",
                        description: integration.description,
                        badges: [
                            { label: integration.isEnabled ? "Aktif" : "Pasif", color: integration.isEnabled ? "success" : "gray" },
                            { label: integration.type, color: "info" },
                            ...(integration.isSystemManaged ? [{ label: "Sistem Yönetimli", color: "warning" }] : []),
                        ],
                        stats: [
                            { label: "Kimlik Bilgisi", value: integration.hasCredentials ? integration.credentialsPreview ?? "Tanımlı" : "Tanımlı değil" },
                            {
                                label: "Son Test",
                                value: integration.lastTestedAt
                                    ? `${new Date(integration.lastTestedAt).toLocaleString("tr-TR")} ${integration.lastTestSucceeded ? "✓" : "✗"}`
                                    : "Hiç test edilmedi",
                            },
                        ],
                        actions: canManage ? (
                            <ActionDropdown
                                items={[
                                    {
                                        label: "Test Et",
                                        icon: "activity",
                                        onClick: async () => {
                                            try {
                                                await test.mutateAsync(integration.id);
                                                showSuccess("Entegrasyon test edildi.");
                                            } catch (err) {
                                                showApiError(err);
                                            }
                                        },
                                    },
                                    { label: "Düzenle", icon: "edit", onClick: () => openEdit(integration) },
                                    {
                                        label: "Sil",
                                        icon: "trash",
                                        color: "danger",
                                        onClick: () => setPendingDelete(integration),
                                        disabled: integration.isSystemManaged,
                                    },
                                ]}
                            />
                        ) : undefined,
                    }))}
                />
            </Content>

            <FormModal
                open={modalOpen}
                toggle={() => setModalOpen(false)}
                title={editing ? "Entegrasyonu Düzenle" : "Yeni Entegrasyon"}
                size="lg"
                loading={isPending}
                onSubmit={handleSubmit(onSubmit)}
            >
                <FormProvider {...methods}>
                    <div className="row g-3">
                        <div className="col-md-6">
                            <TextInput label="Ad" required {...register("name", { required: true })} />
                        </div>
                        <div className="col-md-3">
                            <label className="form-label">Tip</label>
                            <select className="form-select" disabled={Boolean(editing)} {...register("type")}>
                                {TYPE_OPTIONS.map((t) => (
                                    <option key={t} value={t}>
                                        {t}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="col-md-3">
                            <TextInput
                                label="Sağlayıcı Anahtarı"
                                required
                                disabled={Boolean(editing)}
                                placeholder="Örn: Mailjet"
                                {...register("providerKey", { required: true })}
                            />
                        </div>
                        <div className="col-12">
                            <Textarea label="Açıklama" {...register("description")} />
                        </div>
                        <div className="col-12">
                            <JsonFieldEditor name="configJson" label="Yapılandırma" type="object" />
                        </div>
                        <div className="col-12">
                            <JsonFieldEditor name="credentialsJson" label="Kimlik Bilgileri" type="object" />
                            {editing && (
                                <p className="text-soft fs-12px mt-1">
                                    Boş bırakılırsa mevcut kimlik bilgileri korunur.
                                </p>
                            )}
                        </div>
                        <div className="col-12">
                            <Checkbox label="Aktif" switchStyle {...register("isEnabled")} />
                        </div>
                    </div>
                </FormProvider>
            </FormModal>

            <ConfirmDialog
                open={Boolean(pendingDelete)}
                title="Entegrasyon Silinsin mi?"
                message={`"${pendingDelete?.name}" entegrasyonu kalıcı olarak silinecek.`}
                variant="danger"
                loading={remove.isPending}
                onCancel={() => setPendingDelete(null)}
                onConfirm={async () => {
                    if (!pendingDelete) return;
                    try {
                        await remove.mutateAsync(pendingDelete.id);
                        showSuccess("Entegrasyon silindi.");
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

export default SystemIntegrationsPage;
