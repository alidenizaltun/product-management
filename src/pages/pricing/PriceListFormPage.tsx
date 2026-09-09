import React, { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { TextInput, Textarea, Checkbox, FormPage, UnsavedChangesDialog } from "@/components/shared";
import { useUnsavedChangesGuard } from "@/application/hooks/useUnsavedChangesGuard";
import { usePriceList, usePriceListMutations } from "@/application/hooks/usePricing";
import { showApiError, showSuccess } from "@/components/shared/NotificationAlert";
import { DEFAULT_CURRENCY_CODE } from "@/shared/config/currency";

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
    getValues,
    formState: { errors, isDirty },
  } = useForm<FormValues>({
    defaultValues: {
      code: "",
      name: "",
      description: "",
      currencyCode: DEFAULT_CURRENCY_CODE,
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
      name: values.name,
      description: values.description || undefined,
      currencyCode: values.currencyCode,
      isActive: values.isActive,
      validFrom: values.validFrom || undefined,
      validTo: values.validTo || undefined,
      salesChannel: values.salesChannel || undefined,
      customerGroupCode: values.customerGroupCode || undefined,
    };

    try {
      if (isEdit && id) {
        await update.mutateAsync({ id, payload: { ...payload, code: values.code } });
      } else {
        // Yeni kayıtta kod gönderilmez; sistem üretir.
        await create.mutateAsync(payload);
      }
      showSuccess(isEdit ? "Fiyat listesi güncellendi." : "Fiyat listesi oluşturuldu.");
      allowNextNavigation();
      navigate("/pricing/price-lists");
    } catch (err) {
      showApiError(err);
    }
  };

  const isPending = create.isPending || update.isPending;
  const title = isEdit ? "Fiyat Listesi Düzenle" : "Yeni Fiyat Listesi";
  const { blocker, allowNextNavigation } = useUnsavedChangesGuard(isDirty);

  return (
    <>
      <FormPage
        title={title}
        loading={isEdit && isLoading}
        saving={isPending}
        onSubmit={handleSubmit(onSubmit)}
        onCancel={() => navigate("/pricing/price-lists")}
      >
        <div className="card card-bordered">
          <div className="card-inner">
            <div className="row g-3">
              <input type="hidden" {...register("currencyCode")} />

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
                  error={errors.name?.message}
                  {...register("name", { required: "Ad zorunludur" })}
                />
              </div>

              <div className="col-md-6">
                <TextInput label="Satış Kanalı" placeholder="web, mobile, pos..." {...register("salesChannel")} />
              </div>

              <div className="col-md-6">
                <TextInput
                  label="Müşteri Grubu Kodu"
                  placeholder="retail, wholesale, vip..."
                  {...register("customerGroupCode")}
                />
              </div>

              <div className="col-md-6">
                <TextInput label="Geçerlilik Başlangıcı" type="datetime-local" {...register("validFrom")} />
              </div>

              <div className="col-md-6">
                <TextInput
                  label="Geçerlilik Bitişi"
                  type="datetime-local"
                  error={errors.validTo?.message}
                  {...register("validTo", {
                    validate: (value) => {
                      const from = getValues("validFrom");
                      if (from && value && value < from) {
                        return "Bitiş tarihi başlangıç tarihinden önce olamaz";
                      }
                      return true;
                    },
                  })}
                />
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

export default PriceListFormPage;
