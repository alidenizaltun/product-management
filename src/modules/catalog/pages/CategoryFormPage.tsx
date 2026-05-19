import React, { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { Button } from "reactstrap";
import Content from "@/layout/content/Content";
import Head from "@/layout/head/Head";
import Icon from "@/components/icon/Icon";
import { Block } from "@/components/Component";
import PageHeader from "@/modules/shared/components/PageHeader";
import { useCategories, useCategory, useCategoryMutations } from "@/modules/catalog/hooks/useCatalog";
import { showApiError, showSuccess } from "@/modules/shared/components/NotificationAlert";

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
      code: values.code,
      name: values.name,
      description: values.description || undefined,
      parentCategoryId: values.parentCategoryId || undefined,
    };

    try {
      if (isEdit && id) {
        await update.mutateAsync({ id, payload });
      } else {
        await create.mutateAsync(payload);
      }
      showSuccess(isEdit ? "Kategori güncellendi." : "Kategori oluşturuldu.");
      navigate("/catalog/categories");
    } catch (err) {
      showApiError(err);
    }
  };

  const isPending = create.isPending || update.isPending;
  const title = isEdit ? "Kategori Düzenle" : "Yeni Kategori";

  return (
    <>
      <Head title={title} />
      <Content>
        <PageHeader
          title={title}
          description="Kategori bilgilerini girin."
          actions={
            <div className="d-flex gap-2">
              <Button color="light py-2" onClick={() => navigate("/catalog/categories")} disabled={isPending}>
                İptal
              </Button>
              <Button color="primary py-2" type="submit" form="category-form" disabled={isPending || (!isDirty && !isEdit)}>
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
                <form id="category-form" onSubmit={handleSubmit(onSubmit)} className="row g-3">
                  <div className="col-md-4">
                    <label className="form-label">
                      Kod <span className="text-danger">*</span>
                    </label>
                    <input
                      className={`form-control ${errors.code ? "is-invalid" : ""}`}
                      placeholder="CAT-001"
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
                      placeholder="Kategori adı"
                      {...register("name", { required: "Ad zorunludur" })}
                    />
                    {errors.name && <div className="invalid-feedback">{errors.name.message}</div>}
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">Üst Kategori</label>
                    <select className="form-control form-select" {...register("parentCategoryId")}>
                      <option value="">— Yok (Kök Kategori) —</option>
                      {categories
                        .filter((c) => c.id !== id)
                        .map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name}
                          </option>
                        ))}
                    </select>
                  </div>

                  <div className="col-12">
                    <label className="form-label">Açıklama</label>
                    <textarea
                      className="form-control"
                      rows={3}
                      placeholder="Kategori açıklaması"
                      {...register("description")}
                    />
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

export default CategoryFormPage;
