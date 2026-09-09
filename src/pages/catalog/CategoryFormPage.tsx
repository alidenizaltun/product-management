import React, { useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { TextInput, Textarea, FormField, FormPage, UnsavedChangesDialog } from "@/components/shared";
import { useUnsavedChangesGuard } from "@/application/hooks/useUnsavedChangesGuard";
import { useCategories, useCategory, useCategoryMutations } from "@/application/hooks/useCatalog";
import { showApiError, showSuccess } from "@/components/shared/NotificationAlert";
import { formatCategoryTreeLabel, sortCategoriesHierarchically } from "@/pages/catalog/utils/categoryHierarchy";

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
  const parentOptions = useMemo(
    () => sortCategoriesHierarchically(categories).filter(({ item }) => item.id !== id),
    [categories, id]
  );

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
      <FormPage
        title={title}
        subtitle="Kategori bilgilerini girin."
        loading={isEdit && isLoading}
        saving={isPending}
        onSubmit={handleSubmit(onSubmit)}
        onCancel={() => navigate("/definitions/categories")}
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
                    {parentOptions.map(({ item, depth }) => (
                      <option key={item.id} value={item.id}>
                        {formatCategoryTreeLabel(item.name, depth)}
                      </option>
                    ))}
                  </select>
                </FormField>
              </div>

              <div className="col-12">
                <Textarea label="Açıklama" rows={3} placeholder="Kategori açıklaması" {...register("description")} />
              </div>
            </div>
          </div>
        </div>
      </FormPage>

      <UnsavedChangesDialog blocker={blocker} />
    </>
  );
};

export default CategoryFormPage;
