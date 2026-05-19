import React, { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { Button } from "reactstrap";
import Content from "@/layout/content/Content";
import Head from "@/layout/head/Head";
import Icon from "@/components/icon/Icon";
import { Block } from "@/components/Component";
import PageHeader from "@/modules/shared/components/PageHeader";
import { useWarehouse, useWarehouseMutations } from "@/modules/catalog/hooks/useCatalog";
import { showApiError, showSuccess } from "@/modules/shared/components/NotificationAlert";

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
    formState: { errors },
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
      code: values.code,
      name: values.name,
      description: values.description || undefined,
      address: values.address || undefined,
      city: values.city || undefined,
      country: values.country || undefined,
      isActive: values.isActive,
    };

    try {
      if (isEdit && id) {
        await update.mutateAsync({ id, payload });
      } else {
        await create.mutateAsync(payload);
      }
      showSuccess(isEdit ? "Depo güncellendi." : "Depo oluşturuldu.");
      navigate("/catalog/warehouses");
    } catch (err) {
      showApiError(err);
    }
  };

  const isPending = create.isPending || update.isPending;
  const title = isEdit ? "Depo Düzenle" : "Yeni Depo";

  return (
    <>
      <Head title={title} />
      <Content>
        <PageHeader
          title={title}
          actions={
            <div className="d-flex gap-2">
              <Button color="light py-2" onClick={() => navigate("/catalog/warehouses")} disabled={isPending}>
                İptal
              </Button>
              <Button color="primary py-2" type="submit" form="warehouse-form" disabled={isPending}>
                {isPending ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" />
                    Kaydediliyor...
                  </>
                ) : (
                  <>
                    <Icon name="save" className="me-1" />
                    Kaydet
                  </>
                )}
              </Button>
            </div>
          }
        />
        <Block>
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
                <form id="warehouse-form" onSubmit={handleSubmit(onSubmit)} className="row g-3">
                  <div className="col-md-4">
                    <label className="form-label">
                      Kod <span className="text-danger">*</span>
                    </label>
                    <input
                      className={`form-control ${errors.code ? "is-invalid" : ""}`}
                      placeholder="WH-IST-01"
                      {...register("code", { required: "Kod zorunludur" })}
                    />
                    {errors.code && <div className="invalid-feedback">{errors.code.message}</div>}
                  </div>

                  <div className="col-md-8">
                    <label className="form-label">
                      Ad <span className="text-danger">*</span>
                    </label>
                    <input
                      className={`form-control ${errors.name ? "is-invalid" : ""}`}
                      placeholder="Depo adı"
                      {...register("name", { required: "Ad zorunludur" })}
                    />
                    {errors.name && <div className="invalid-feedback">{errors.name.message}</div>}
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">Şehir</label>
                    <input className="form-control" {...register("city")} />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">Ülke</label>
                    <input className="form-control" {...register("country")} />
                  </div>

                  <div className="col-12">
                    <label className="form-label">Adres</label>
                    <textarea className="form-control" rows={2} {...register("address")} />
                  </div>

                  <div className="col-12">
                    <label className="form-label">Açıklama</label>
                    <textarea className="form-control" rows={2} {...register("description")} />
                  </div>

                  <div className="col-12">
                    <div className="form-check form-switch">
                      <input
                        type="checkbox"
                        className="form-check-input"
                        id="warehouse-active"
                        {...register("isActive")}
                      />
                      <label className="form-check-label" htmlFor="warehouse-active">
                        Aktif
                      </label>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          )}
        </Block>
      </Content>
    </>
  );
};

export default WarehouseFormPage;
