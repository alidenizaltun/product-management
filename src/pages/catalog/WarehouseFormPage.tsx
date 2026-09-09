import React, { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { TextInput, Textarea, Checkbox, FormPage, UnsavedChangesDialog } from "@/components/shared";
import { useUnsavedChangesGuard } from "@/application/hooks/useUnsavedChangesGuard";
import { useWarehouse, useWarehouseMutations } from "@/application/hooks/useCatalog";
import { showApiError, showSuccess } from "@/components/shared/NotificationAlert";

interface WarehouseFormValues {
  code: string;
  name: string;
  description?: string;
  address?: string;
  city?: string;
  country?: string;
  isActive: boolean;
}

const WarehouseFormPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const { data: warehouse, isLoading } = useWarehouse(id);
  const { create, update } = useWarehouseMutations();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<WarehouseFormValues>({
    defaultValues: {
      code: "",
      name: "",
      description: "",
      address: "",
      city: "",
      country: "",
      isActive: true,
    },
  });

  useEffect(() => {
    if (warehouse) {
      reset({
        code: warehouse.code,
        name: warehouse.name,
        description: warehouse.description ?? "",
        address: warehouse.address ?? "",
        city: warehouse.city ?? "",
        country: warehouse.country ?? "",
        isActive: warehouse.isActive,
      });
    }
  }, [warehouse, reset]);

  const onSubmit = async (values: WarehouseFormValues) => {
    const payload = {
      name: values.name,
      description: values.description || undefined,
      address: values.address || undefined,
      city: values.city || undefined,
      country: values.country || undefined,
      isActive: values.isActive,
    };

    try {
      if (isEdit && id) {
        await update.mutateAsync({ id, payload: { ...payload, code: values.code } });
      } else {
        // Yeni kayıtta kod gönderilmez; sistem üretir.
        await create.mutateAsync(payload);
      }
      showSuccess(isEdit ? "Depo güncellendi." : "Depo oluşturuldu.");
      allowNextNavigation();
      navigate("/definitions/warehouses");
    } catch (err) {
      showApiError(err);
    }
  };

  const isPending = create.isPending || update.isPending;
  const title = isEdit ? "Depo Düzenle" : "Yeni Depo";
  const { blocker, allowNextNavigation } = useUnsavedChangesGuard(isDirty);

  return (
    <>
      <FormPage
        title={title}
        loading={isEdit && isLoading}
        saving={isPending}
        onSubmit={handleSubmit(onSubmit)}
        onCancel={() => navigate("/definitions/warehouses")}
      >
        <div className="card card-bordered">
          <div className="card-inner">
            <div className="row g-3">
              {isEdit && (
                <div className="col-md-4">
                  <TextInput
                    label="Kod"
                    required
                    error={errors.code?.message}
                    {...register("code", { required: "Kod zorunludur" })}
                  />
                </div>
              )}

              <div className={isEdit ? "col-md-8" : "col-md-12"}>
                <TextInput
                  label="Ad"
                  required
                  placeholder="Depo adı"
                  error={errors.name?.message}
                  {...register("name", { required: "Ad zorunludur" })}
                />
              </div>

              <div className="col-md-6">
                <TextInput label="Şehir" {...register("city")} />
              </div>

              <div className="col-md-6">
                <TextInput label="Ülke" {...register("country")} />
              </div>

              <div className="col-12">
                <Textarea label="Adres" rows={2} {...register("address")} />
              </div>

              <div className="col-12">
                <Textarea label="Açıklama" rows={2} {...register("description")} />
              </div>

              <div className="col-12">
                <Checkbox label="Aktif" switchStyle {...register("isActive")} />
              </div>
            </div>
          </div>
        </div>
      </FormPage>

      <UnsavedChangesDialog blocker={blocker} />
    </>
  );
};

export default WarehouseFormPage;
