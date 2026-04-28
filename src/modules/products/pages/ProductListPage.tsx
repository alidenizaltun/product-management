import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Content from "@/layout/content/Content";
import Head from "@/layout/head/Head";
import DataTableServer, { DataColumn } from "@/modules/shared/components/DataTableServer";
import { ProductDto } from "@/domain";
import { useProducts } from "@/modules/products/hooks/useProducts";

const ProductListPage: React.FC = () => {
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const { data, isLoading } = useProducts({ page, pageSize });

  const columns: DataColumn<ProductDto>[] = useMemo(
    () => [
      { key: "code", title: "Kod", render: (item) => item.productCode },
      { key: "name", title: "Ad", render: (item) => item.name },
      { key: "kind", title: "Tür", render: (item) => item.kind },
      { key: "status", title: "Durum", render: (item) => item.status },
      {
        key: "actions",
        title: "İşlemler",
        render: (item) => (
          <div className="d-flex gap-2">
            <Link className="btn btn-sm btn-outline-primary" to={`/products/${item.id}`}>
              Detay
            </Link>
            <Link className="btn btn-sm btn-primary" to={`/products/${item.id}/edit`}>
              Düzenle
            </Link>
          </div>
        ),
      },
    ],
    []
  );

  return (
    <>
      <Head title="Ürün Listesi" />
      <Content>
        <div className="nk-block-head nk-block-head-sm">
          <div className="nk-block-between g-3">
            <div className="nk-block-head-content">
              <h3 className="nk-block-title page-title">Ürün Listesi</h3>
            </div>
            <div className="nk-block-head-content">
              <Link to="/products/new" className="btn btn-primary">Yeni Ürün</Link>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="card card-bordered"><div className="card-inner">Yükleniyor...</div></div>
        ) : (
          <DataTableServer
            title="Ürünler"
            columns={columns}
            items={data?.items ?? []}
            page={page}
            pageSize={pageSize}
            totalItems={data?.totalCount ?? 0}
            onPageChange={setPage}
          />
        )}
      </Content>
    </>
  );
};

export default ProductListPage;
