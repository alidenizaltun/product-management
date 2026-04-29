import React, { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { Button } from "reactstrap";
import Content from "@/layout/content/Content";
import Head from "@/layout/head/Head";
import Icon from "@/components/icon/Icon";
import { Block } from "@/components/Component";
import PageHeader from "@/modules/shared/components/PageHeader";
import { usePriceList, usePriceListMutations } from "@/modules/pricing/hooks/usePricing";

interface FormValues {
  code: string;
  name: string;
  description?: string;
  currencyCode: string;
  isActive: boolean;
  validFrom?: string;
  validTo?: string;
  salesChannel?: string;
  customerGroupCode?: string;
}

const PriceListFormPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const { data: priceList, isLoading } = usePriceList(id);
  const { create, update } = usePriceListMutations();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      code: "",
      name: "",
      description: "",
      currencyCode: "TRY",
      isActive: true,
      validFrom: "",
      validTo: "",
      salesChannel: "",
      customerGroupCode: "",
    },
  });

  useEffect(() => {
    if (priceList) {
      reset({
        code: priceList.code,
        name: priceList.name,
        description: priceList.description ?? "",
        currencyCode: priceList.currencyCode,
        isActive: priceList.isActive,
        validFrom: priceList.validFrom?.slice(0, 16) ?? "",
        validTo: priceList.validTo?.slice(0, 16) ?? "",
        salesChannel: priceList.salesChannel ?? "",
        customerGroupCode: priceList.customerGroupCode ?? "",
      });
    }
  }, [priceList, reset]);

  const onSubmit = async (values: FormValues) => {
    const payload = {
      code: values.code,
      name: values.name,
      description: values.description || undefined,
      currencyCode: values.currencyCode,
      isActive: values.isActive,
      validFrom: values.validFrom || undefined,
      validTo: values.validTo || undefined,
      salesChannel: values.salesChannel || undefined,
      customerGroupCode: values.customerGroupCode || undefined,
    };

    if (isEdit && id) {
      await update.mutateAsync({ id, payload });
    } else {
      await create.mutateAsync(payload);
    }
    navigate("/pricing/pricelists");
  };

  const isPending = create.isPending || update.isPending;
  const title = isEdit ? "Fiyat Listesi Düzenle" : "Yeni Fiyat Listesi";

  return (
    <>
      <Head title={title} />
      <Content>
        <PageHeader
          title={title}
          actions={
            <div className="d-flex gap-2">
              <Button color="light py-2" onClick={() => navigate("/pricing/pricelists")} disabled={isPending}>
                İptal
              </Button>
              <Button color="primary py-2" type="submit" form="pricelist-form" disabled={isPending}>
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
                <form id="pricelist-form" onSubmit={handleSubmit(onSubmit)} className="row g-3">
                  <div className="col-md-4">
                    <label className="form-label">
                      Kod <span className="text-danger">*</span>
                    </label>
                    <input
                      className={`form-control ${errors.code ? "is-invalid" : ""}`}
                      placeholder="PL-RETAIL"
                      {...register("code", { required: "Kod zorunludur" })}
                    />
                    {errors.code && <div className="invalid-feedback">{errors.code.message}</div>}
                  </div>

                  <div className="col-md-5">
                    <label className="form-label">
                      Ad <span className="text-danger">*</span>
                    </label>
                    <input
                      className={`form-control ${errors.name ? "is-invalid" : ""}`}
                      {...register("name", { required: "Ad zorunludur" })}
                    />
                    {errors.name && <div className="invalid-feedback">{errors.name.message}</div>}
                  </div>

                  <div className="col-md-3">
                    <label className="form-label">Para Birimi</label>
                    <select className="form-control form-select" {...register("currencyCode")}>
                      <option value="TRY">TRY</option>
                      <option value="USD">USD</option>
                      <option value="EUR">EUR</option>
                      <option value="GBP">GBP</option>
                    </select>
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">Satış Kanalı</label>
                    <input className="form-control" placeholder="web, mobile, pos..." {...register("salesChannel")} />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">Müşteri Grubu Kodu</label>
                    <input
                      className="form-control"
                      placeholder="retail, wholesale, vip..."
                      {...register("customerGroupCode")}
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">Geçerlilik Başlangıcı</label>
                    <input type="datetime-local" className="form-control" {...register("validFrom")} />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">Geçerlilik Bitişi</label>
                    <input type="datetime-local" className="form-control" {...register("validTo")} />
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
                        id="pl-active"
                        {...register("isActive")}
                      />
                      <label className="form-check-label" htmlFor="pl-active">
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

export default PriceListFormPage;
