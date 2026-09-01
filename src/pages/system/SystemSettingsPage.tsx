import React, { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import Content from "@/layout/content/Content";
import Head from "@/layout/head/Head";
import Icon from "@/components/icon/Icon";
import PageHeader from "@/components/shared/PageHeader";
import { SettingsLayout, SettingsCard } from "@/components/shared/SettingsLayout";
import type { SettingsSection } from "@/components/shared/SettingsLayout";
import { TextInput, NumberInput, Checkbox, LoadingButton } from "@/components/shared";
import EmptyState from "@/components/shared/EmptyState";
import { usePermission } from "@/application/hooks/usePermission";
import { showApiError, showSuccess } from "@/components/shared/NotificationAlert";
import type { SystemSetting } from "@/domain/types/system.types";
import { useSystemSettings, useSystemSettingsMutations } from "@/application/hooks/useSystemSettings";

const CategoryForm: React.FC<{ settings: SystemSetting[]; canManage: boolean }> = ({ settings, canManage }) => {
    const { bulkUpdate } = useSystemSettingsMutations();

    const defaultValues = useMemo(
        () => Object.fromEntries(settings.map((s) => [s.id, s.value ?? ""])),
        [settings]
    );

    const { register, handleSubmit, reset } = useForm<Record<string, string>>({ defaultValues });

    useEffect(() => {
        reset(defaultValues);
    }, [defaultValues, reset]);

    const onSubmit = async (values: Record<string, string>) => {
        try {
            await bulkUpdate.mutateAsync({
                items: settings.map((s) => ({ id: s.id, value: values[s.id] })),
            });
            showSuccess("Ayarlar kaydedildi.");
        } catch (err) {
            showApiError(err);
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="row g-3">
            {settings.map((setting) => (
                <div className="col-md-6" key={setting.id}>
                    {setting.dataType === "Boolean" ? (
                        <Checkbox
                            label={setting.displayName}
                            switchStyle
                            disabled={!canManage || !setting.isEditable}
                            {...register(setting.id, { setValueAs: (v) => (v ? "true" : "false") })}
                        />
                    ) : setting.dataType === "Number" ? (
                        <NumberInput
                            label={setting.displayName}
                            hint={setting.description}
                            disabled={!canManage || !setting.isEditable}
                            {...register(setting.id)}
                        />
                    ) : (
                        <TextInput
                            label={setting.displayName}
                            hint={setting.description}
                            disabled={!canManage || !setting.isEditable}
                            {...register(setting.id)}
                        />
                    )}
                </div>
            ))}

            {canManage && (
                <div className="col-12">
                    <LoadingButton color="primary" type="submit" loading={bulkUpdate.isPending}>
                        <Icon name="save" id="" className="me-1" style={{}} />
                        Kaydet
                    </LoadingButton>
                </div>
            )}
        </form>
    );
};

const SystemSettingsPage: React.FC = () => {
    const canManage = usePermission("Settings.Manage");
    const { data: settings = [], isLoading } = useSystemSettings();
    const [activeSection, setActiveSection] = useState<string>("");

    const categories = useMemo(() => {
        const map = new Map<string, SystemSetting[]>();
        settings.forEach((s) => {
            const list = map.get(s.category) ?? [];
            list.push(s);
            map.set(s.category, list);
        });
        return Array.from(map.entries());
    }, [settings]);

    useEffect(() => {
        if (!activeSection && categories.length > 0) {
            setActiveSection(categories[0][0]);
        }
    }, [categories, activeSection]);

    const sections: SettingsSection[] = categories.map(([category, items]) => ({
        id: category,
        label: category,
        icon: "setting",
        content: (
            <SettingsCard title={category} description={`${items.length} ayar`} divider={false}>
                <CategoryForm settings={items} canManage={canManage} />
            </SettingsCard>
        ),
    }));

    return (
        <>
            <Head title="Sistem Ayarları" />
            <Content>
                <PageHeader title="Sistem Ayarları" description="Genel uygulama ayarlarını görüntüleyin ve düzenleyin." />
                {isLoading ? (
                    <div className="card card-bordered">
                        <div className="card-inner d-flex align-items-center gap-2">
                            <span className="spinner-border spinner-border-sm text-primary" />
                            <span>Yükleniyor...</span>
                        </div>
                    </div>
                ) : sections.length === 0 ? (
                    <div className="card card-bordered">
                        <EmptyState icon="setting" title="Tanımlı ayar bulunamadı" />
                    </div>
                ) : (
                    <SettingsLayout
                        title="Ayar Kategorileri"
                        sections={sections}
                        activeSection={activeSection || sections[0].id}
                        onSectionChange={setActiveSection}
                    />
                )}
            </Content>
        </>
    );
};

export default SystemSettingsPage;
