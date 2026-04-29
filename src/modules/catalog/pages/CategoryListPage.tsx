import React, { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "reactstrap";
import Content from "@/layout/content/Content";
import Head from "@/layout/head/Head";
import Icon from "@/components/icon/Icon";
import { Block } from "@/components/Component";
import PageHeader from "@/modules/shared/components/PageHeader";
import DataTableServer, { DataColumn } from "@/modules/shared/components/DataTableServer";
import ConfirmDialog from "@/modules/shared/components/ConfirmDialog";
import { ProductCategoryDto } from "@/domain";
import { useCategories, useCategoryMutations } from "@/modules/catalog/hooks/useCatalog";

const PAGE_SIZE = 10;

const CategoryListPage: React.FC = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [pendingDelete, setPendingDelete] = useState<ProductCategoryDto | null>(null);

  const { data: categories = [], isLoading } = useCategories();
  const { remove } = useCategoryMutations();

  const paginated = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return categories.slice(start, start + PAGE_SIZE);
  }, [categories, page]);

  const columns: DataColumn<ProductCategoryDto>[] = useMemo(
    () => [
      { key: "code", title: "Kod", render: (it) => <span className="fw-medium">{it.code}</span> },
      { key: "name", title: "Ad", render: (it) => it.name },
      {
        key: "description",
        title: "Açıklama",
        render: (it) => <span className="text-soft">{it.description || "—"}</span>,
      },
      {
        key: "parent",
        title: "Üst Kategori",
        render: (it) => <span className="text-soft">{it.parentCategoryId ? "Evet" : "—"}</span>,
      },
      {
        key: "actions",
        title: "İşlemler",
        className: "nk-tb-col-tools",
        render: (it) => (
          <ul className="nk-tb-actions gx-1 justify-content-end">
            <li>
              <Link to={`/catalog/categories/${it.id}`} className="btn btn-icon btn-trigger" title="Detay">
                <Icon name="eye" />
              </Link>
            </li>
            <li>
              <Link to={`/catalog/categories/${it.id}/edit`} className="btn btn-icon btn-trigger" title="Düzenle">
                <Icon name="edit" />
              </Link>
            </li>
            <li>
              <button
                type="button"
                className="btn btn-icon btn-trigger text-danger"
                title="Sil"
                onClick={() => setPendingDelete(it)}
              >
                <Icon name="trash" />
              </button>
            </li>
          </ul>
        ),
      },
    ],
    []
  );

  return (
    <>
      <Head title="Kategoriler" />
      <Content>
        <PageHeader
          title="Kategoriler"
          description="Ürün kategori hiyerarşisini yönetin."
          actions={
            <Button color="primary" onClick={() => navigate("/catalog/categories/new")}>
              <Icon name="plus" className="me-1" />
              Yeni Kategori
            </Button>
          }
        />
        <Block>
          <DataTableServer
            columns={columns}
            items={paginated}
            page={page}
            pageSize={PAGE_SIZE}
            totalItems={categories.length}
            onPageChange={setPage}
            isLoading={isLoading}
            emptyTitle="Henüz kategori yok"
            emptyDescription="İlk kategoriyi ekleyerek başlayın."
            emptyIcon="layers"
            rowKey={(it) => it.id}
            emptyAction={
              <Button color="primary" onClick={() => navigate("/catalog/categories/new")}>
                <Icon name="plus" className="me-1" />
                Yeni Kategori
              </Button>
            }
          />
        </Block>
      </Content>

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title="Kategori Silinsin mi?"
        message={`"${pendingDelete?.name}" kategorisi kalıcı olarak silinecek. Bu işlem geri alınamaz.`}
        variant="danger"
        loading={remove.isPending}
        onCancel={() => setPendingDelete(null)}
        onConfirm={async () => {
          if (!pendingDelete) return;
          await remove.mutateAsync(pendingDelete.id);
          setPendingDelete(null);
        }}
      />
    </>
  );
};

export default CategoryListPage;
