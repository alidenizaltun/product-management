import React, { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import Content from "@/layout/content/Content";
import Head from "@/layout/head/Head";
import Icon from "@/components/icon/Icon";
import { Block } from "@/components/Component";
import PageHeader from "@/components/shared/PageHeader";
import { TextInput, Textarea, FormField, LoadingButton, UnsavedChangesDialog } from "@/components/shared";
import { useUnsavedChangesGuard } from "@/application/hooks/useUnsavedChangesGuard";
import { useCategories, useCategory, useCategoryMutations } from "@/application/hooks/useCatalog";
import { showApiError, showSuccess } from "@/components/shared/NotificationAlert";

interface CategoryFormValues {
  code: string;
  name: string;
  description?: string;
  parentCategoryId?: string;
}

const CategoryFormPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const { data: category, isLoading } = useCategory(id);
  const { data: categories = [] } = useCategories();
  const { create, update } = useCategoryMutations();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<CategoryFormValues>({
    defaultValues: { code: "", name: "", description: "", parentCategoryId: "" },
  });

  useEffect(() => {
    if (category) {
      reset({
        code: category.code,
        name: category.name,
        description: category.description ?? "",
        parentCategoryId: category.parentCategoryId ?? "",
      });
    }
  }, [category, reset]);

  const onSubmit = async (values: CategoryFormValues) => {
    const payload = {
      name: values.name,
      description: values.description || undefined,
      parentCategoryId: values.parentCategoryId || undefined,
    };

    try {
      if (isEdit && id) {
        await update.mutateAsync({ id, payload: { ...payload, code: values.code } });
      } else {
        // Yeni kayıtta kod gönderilmez; sistem üretir.
        await create.mutateAsync(payload);
      }
      showSuccess(isEdit ? "Kategori güncellendi." : "Kategori oluşturuldu.");
      allowNextNavigation();
      navigate("/definitions/categories");
    } catch (err) {
      showApiError(err);
    }
  };

  const isPending = create.isPending || update.isPending;
  const title = isEdit ? "Kategori Düzenle" : "Yeni Kategori";
  const { blocker, allowNextNavigation } = useUnsavedChangesGuard(isDirty);

  return (
    <>
      <Head title={title} />
      <Content>
        <PageHeader
          title={title}
          description={
            isEdit ? "Kategori bilgilerini girin." : "Kategori bilgilerini girin. Kod sistem tarafından üretilir."
          }
          actions={
            <div className="d-flex gap-2">
              <button
                type="button"
                className="btn btn-light py-2"
                onClick={() => navigate("/definitions/categories")}
                disabled={isPending}
              >
                İptal
              </button>
              <LoadingButton
                color="primary py-2"
                type="submit"
                form="category-form"
                loading={isPending}
                disabled={!isDirty && !isEdit}
              >
                <Icon name="save" className="me-1" />
                Kaydet
              </LoadingButton>
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
                <form id="category-form" onSubmit={handleSubmit(onSubmit)} className="row g-3">
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

                  <div className={isEdit ? "col-md-4" : "col-md-6"}>
                    <TextInput
                      label="Ad"
                      required
                      placeholder="Kategori adı"
                      error={errors.name?.message}
                      {...register("name", { required: "Ad zorunludur" })}
                    />
                  </div>

                  <div className={isEdit ? "col-md-4" : "col-md-6"}>
                    <FormField label="Üst Kategori" htmlFor="category-parent">
                      <select id="category-parent" className="form-control form-select" {...register("parentCategoryId")}>
                        <option value="">— Yok (Kök Kategori) —</option>
                        {categories
                          .filter((c) => c.id !== id)
                          .map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.name}
                            </option>
                          ))}
                      </select>
                    </FormField>
                  </div>

                  <div className="col-12">
                    <Textarea label="Açıklama" rows={3} placeholder="Kategori açıklaması" {...register("description")} />
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

export default CategoryFormPage;
