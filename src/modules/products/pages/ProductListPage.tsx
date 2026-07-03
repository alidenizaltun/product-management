import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "reactstrap";
import Content from "@/layout/content/Content";
import Head from "@/layout/head/Head";
import { Block } from "@/components/Component";
import PageHeader from "@/modules/shared/components/PageHeader";
import EmptyState from "@/modules/shared/components/EmptyState";
import ConfirmDialog from "@/modules/shared/components/ConfirmDialog";
import DataTablePagination from "@/components/pagination/DataTablePagination";
import ProductCard from "@/modules/products/components/ProductCard";
import { ProductDto } from "@/shared/types/productOperations.types";
import { useProducts } from "@/modules/products/hooks/useProducts";
import { useProductMutations } from "@/modules/products/hooks/useProductMutations";

const PAGE_SIZE = 12;

const KIND_FILTER_OPTIONS = [
  { value: "", label: "Tüm türler" },
  { value: "1", label: "Fiziksel" },
  { value: "2", label: "Yazılım" },
  { value: "3", label: "Hizmet" },
  { value: "4", label: "Abonelik" },
];

const ProductCardSkeleton: React.FC = () => (
  <div className="card card-bordered h-100">
    <div className="placeholder-glow">
      <div className="bg-lighter rounded-top" style={{ height: 200 }} />
      <div className="card-inner">
        <span className="placeholder col-5 mb-2 d-block" />
        <span className="placeholder col-8 mb-2 d-block" />
        <span className="placeholder col-12 mb-2 d-block" />
        <span className="placeholder col-4 d-block" />
      </div>
    </div>
  </div>
);

const ProductListPage: React.FC = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [kindFilter, setKindFilter] = useState("");
  const [pendingDelete, setPendingDelete] = useState<ProductDto | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const { data, isLoading } = useProducts({
    page,
    pageSize: PAGE_SIZE,
    search: search.trim() || undefined,
    kind: kindFilter ? Number(kindFilter) : undefined,
  });
  const { deleteMutation } = useProductMutations();

  const items = data?.items ?? [];
  const totalCount = data?.totalCount ?? 0;
  const selectedProducts = items.filter((product) => selectedIds.includes(product.id));
  const allVisibleSelected = items.length > 0 && items.every((product) => selectedIds.includes(product.id));

  const toggleSelected = (productId: string, selected: boolean) => {
    setSelectedIds((current) =>
      selected ? [...new Set([...current, productId])] : current.filter((id) => id !== productId)
    );
  };

  const exportSelected = () => {
    if (!selectedProducts.length) return;
    const blob = new Blob([JSON.stringify(selectedProducts, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `products-export-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const toolbar = (
    <div className="d-flex flex-wrap align-items-center gap-2 h-100">
      <div className="custom-control custom-checkbox me-1">
        <input
          type="checkbox"
          className="custom-control-input"
          id="select-visible-products"
          checked={allVisibleSelected}
          disabled={items.length === 0}
          onChange={(event) => {
            if (event.target.checked) {
              setSelectedIds((current) => [...new Set([...current, ...items.map((product) => product.id)])]);
              return;
            }
            setSelectedIds((current) => current.filter((id) => !items.some((product) => product.id === id)));
          }}
        />
        <label className="custom-control-label" htmlFor="select-visible-products">
          Seç
        </label>
      </div>
      <div className="form-control-wrap" style={{ minWidth: 200, maxWidth: 320 }}>
        <div className="form-icon form-icon-left">
          <em className="icon ni ni-search" />
        </div>
        <input
          type="search"
          className="form-control form-control-sm ps-5"
          placeholder="Kod veya ad ara…"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
        />
      </div>
      <select
          className="form-select form-select-sm"
          style={{ width: "auto", minWidth: 140 }}
          value={kindFilter}
          onChange={(e) => {
            setKindFilter(e.target.value);
            setPage(1);
          }}
          aria-label="Ürün türü filtresi"
        >
          {KIND_FILTER_OPTIONS.map((o) => (
            <option key={o.value || "all"} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
    </div>
  );

  return (
    <>
      <Head title="Ürünler" />
      <Content>
        <PageHeader
          title="Ürünler"
          description="Ürün kataloğunuzu kart görünümünde yönetin."
          actions={
            <Button color="primary" onClick={() => navigate("/products/new")}>
              <em className="icon ni ni-plus me-1" />
              Yeni Ürün
            </Button>
          }
        />

        <Block className="" size="">
          {selectedProducts.length > 0 && (
            <div className="card card-bordered bg-lighter mb-3">
              <div className="card-inner py-3">
                <div className="d-flex flex-wrap align-items-center justify-content-between gap-3">
                  <div className="d-flex align-items-center gap-2">
                    <span className="btn btn-icon btn-primary">
                      <em className="icon ni ni-check" />
                    </span>
                    <div>
                      <strong>{selectedProducts.length} ürün seçildi</strong>
                      <div className="text-soft fs-12px">Bu sayfadaki seçili ürünler üzerinde işlem yapın.</div>
                    </div>
                  </div>
                  <div className="d-flex flex-wrap gap-2">
                    <Button color="light" size="sm" type="button" disabled>
                      <em className="icon ni ni-check-circle me-1" />
                      Aktif yap
                    </Button>
                    <Button color="light" size="sm" type="button" disabled>
                      <em className="icon ni ni-folder-list me-1" />
                      Kategori ata
                    </Button>
                    <Button color="light" size="sm" type="button" disabled>
                      <em className="icon ni ni-coins me-1" />
                      Fiyat güncelle
                    </Button>
                    <Button color="primary" outline size="sm" type="button" onClick={exportSelected}>
                      <em className="icon ni ni-download me-1" />
                      Dışa aktar
                    </Button>
                    <Button color="light" size="sm" type="button" onClick={() => setSelectedIds([])}>
                      Temizle
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="card card-bordered">
            <div className="card-inner border-bottom py-3">
              <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 h-100">
                {toolbar}
                {!isLoading && (
                  <span className="text-soft fs-12 text-nowrap">
                    <span className="fw-medium text-base">{totalCount}</span> ürün
                  </span>
                )}
              </div>
            </div>

            <div className="card-inner">
              {isLoading ? (
                <div className="row g-3">
                  {Array.from({ length: PAGE_SIZE }).map((_, i) => (
                    <div key={i} className="col-sm-6 col-lg-4 col-xxl-3">
                      <ProductCardSkeleton />
                    </div>
                  ))}
                </div>
              ) : items.length === 0 ? (
                <EmptyState
                  icon="package"
                  title="Henüz ürün yok"
                  description="Katalogunuza ilk ürünü ekleyerek başlayın."
                  action={
                    <Button color="primary" onClick={() => navigate("/products/new")}>
                      <em className="icon ni ni-plus me-1" />
                      Yeni Ürün
                    </Button>
                  }
                />
              ) : (
                <div className="row g-3">
                  {items.map((product) => (
                    <div key={product.id} className="col-sm-6 col-lg-4 col-xxl-3">
                      <ProductCard
                        product={product}
                        selected={selectedIds.includes(product.id)}
                        onSelectChange={(selected) => toggleSelected(product.id, selected)}
                        onDelete={() => setPendingDelete(product)}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {totalCount > 0 && !isLoading && (
              <div className="card-inner border-top pt-3 pb-3">
                <DataTablePagination
                  itemPerPage={PAGE_SIZE}
                  totalItems={totalCount}
                  paginate={setPage}
                  currentPage={page}
                  onChangeRowsPerPage={() => undefined}
                  customItemPerPage={PAGE_SIZE}
                  setRowsPerPage={() => undefined}
                />
              </div>
            )}
          </div>
        </Block>
      </Content>

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title="Ürün Silinsin mi?"
        message={`"${pendingDelete?.name}" ürünü kalıcı olarak silinecek. Bu işlem geri alınamaz.`}
        variant="danger"
        loading={deleteMutation.isPending}
        onCancel={() => setPendingDelete(null)}
        onConfirm={async () => {
          if (!pendingDelete) return;
          await deleteMutation.mutateAsync(pendingDelete.id);
          setPendingDelete(null);
        }}
      />
    </>
  );
};

export default ProductListPage;
