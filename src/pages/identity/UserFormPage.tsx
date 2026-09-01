import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import Content from "@/layout/content/Content";
import Head from "@/layout/head/Head";
import Icon from "@/components/icon/Icon";
import { Block } from "@/components/Component";
import PageHeader from "@/components/shared/PageHeader";
import { TextInput, Checkbox, LoadingButton, UnsavedChangesDialog } from "@/components/shared";
import { useUnsavedChangesGuard } from "@/application/hooks/useUnsavedChangesGuard";
import { useUser, useUserMutations } from "@/application/hooks/useUsers";
import { useRoles } from "@/application/hooks/useRoles";
import { showApiError, showSuccess } from "@/components/shared/NotificationAlert";

interface UserFormValues {
    email: string;
    firstName?: string;
    lastName?: string;
    phoneNumber?: string;
    isActive: boolean;
}

const UserFormPage: React.FC = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEdit = Boolean(id);

    const { data: user, isLoading } = useUser(id);
    const { data: roles = [] } = useRoles();
    const { create, update } = useUserMutations();
    const [selectedRoles, setSelectedRoles] = useState<string[]>([]);

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isDirty },
    } = useForm<UserFormValues>({
        defaultValues: {
            email: "",
            firstName: "",
            lastName: "",
            phoneNumber: "",
            isActive: true,
        },
    });

    useEffect(() => {
        if (user) {
            reset({
                email: user.email,
                firstName: user.firstName ?? "",
                lastName: user.lastName ?? "",
                phoneNumber: user.phoneNumber ?? "",
                isActive: user.isActive,
            });
            setSelectedRoles(user.roles);
        }
    }, [user, reset]);

    const toggleRole = (roleName: string) => {
        setSelectedRoles((prev) =>
            prev.includes(roleName) ? prev.filter((r) => r !== roleName) : [...prev, roleName]
        );
    };

    const onSubmit = async (values: UserFormValues) => {
        try {
            if (isEdit && id) {
                await update.mutateAsync({
                    id,
                    payload: {
                        firstName: values.firstName || undefined,
                        lastName: values.lastName || undefined,
                        phoneNumber: values.phoneNumber || undefined,
                        isActive: values.isActive,
                        roles: selectedRoles,
                    },
                });
                showSuccess("Kullanıcı güncellendi.");
            } else {
                await create.mutateAsync({
                    email: values.email,
                    firstName: values.firstName || undefined,
                    lastName: values.lastName || undefined,
                    phoneNumber: values.phoneNumber || undefined,
                    roles: selectedRoles,
                });
                showSuccess("Kullanıcı oluşturuldu. Şifre belirleme e-postası gönderildi.");
            }
            allowNextNavigation();
            navigate("/identity/users");
        } catch (err) {
            showApiError(err);
        }
    };

    const isPending = create.isPending || update.isPending;
    const title = isEdit ? "Kullanıcı Düzenle" : "Yeni Kullanıcı";
    const { blocker, allowNextNavigation } = useUnsavedChangesGuard(isDirty);

    return (
        <>
            <Head title={title} />
            <Content>
                <PageHeader
                    title={title}
                    description={
                        isEdit
                            ? "Kullanıcı bilgilerini ve rollerini güncelleyin."
                            : "Yeni kullanıcı için e-posta ve roller yeterlidir; şifre belirleme daveti otomatik gönderilir."
                    }
                    actions={
                        <div className="d-flex gap-2">
                            <button
                                type="button"
                                className="btn btn-light py-2"
                                onClick={() => navigate("/identity/users")}
                                disabled={isPending}
                            >
                                İptal
                            </button>
                            <LoadingButton color="primary py-2" type="submit" form="user-form" loading={isPending}>
                                <Icon name="save" id="" className="me-1" style={{}} />
                                Kaydet
                            </LoadingButton>
                        </div>
                    }
                />
                <Block className="" size="">
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
                                <form id="user-form" onSubmit={handleSubmit(onSubmit)} className="row g-3">
                                    <div className="col-md-6">
                                        <TextInput
                                            label="E-posta"
                                            type="email"
                                            required
                                            disabled={isEdit}
                                            placeholder="ornek@sirket.com"
                                            error={errors.email?.message}
                                            {...register("email", {
                                                required: "E-posta zorunludur",
                                                pattern: { value: /^\S+@\S+\.\S+$/, message: "Geçerli bir e-posta girin" },
                                            })}
                                        />
                                    </div>

                                    <div className="col-md-6">
                                        <TextInput
                                            label="Telefon"
                                            placeholder="05xx xxx xx xx"
                                            {...register("phoneNumber")}
                                        />
                                    </div>

                                    <div className="col-md-6">
                                        <TextInput label="Ad" placeholder="Ad" {...register("firstName")} />
                                    </div>

                                    <div className="col-md-6">
                                        <TextInput label="Soyad" placeholder="Soyad" {...register("lastName")} />
                                    </div>

                                    {isEdit && (
                                        <div className="col-12">
                                            <Checkbox label="Aktif" switchStyle {...register("isActive")} />
                                        </div>
                                    )}

                                    <div className="col-12">
                                        <label className="form-label">Roller</label>
                                        <div className="d-flex flex-wrap gap-3">
                                            {roles.length === 0 && (
                                                <span className="text-soft">Henüz tanımlı rol yok.</span>
                                            )}
                                            {roles.map((role) => (
                                                <Checkbox
                                                    key={role.id}
                                                    label={role.name}
                                                    checked={selectedRoles.includes(role.name)}
                                                    onChange={() => toggleRole(role.name)}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}
                </Block>
            </Content>

            <UnsavedChangesDialog blocker={blocker} />
        </>
    );
};

export default UserFormPage;
