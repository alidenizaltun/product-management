import React from "react";
import { Link, useParams } from "react-router-dom";
import Content from "@/layout/content/Content";
import Head from "@/layout/head/Head";
import { useProductDetail } from "@/modules/products/hooks/useProductDetail";

const ProductDetailPage: React.FC = () => {
  const { id } = useParams();
  const { data, isLoading } = useProductDetail(id);

  return (
    <>
      <Head title="Ürün Detayı" />
      <Content>
        {isLoading ? (
          <div className="card card-bordered"><div className="card-inner">Yükleniyor...</div></div>
        ) : (
          <>
            <div className="nk-block-head nk-block-head-sm">
              <div className="nk-block-between g-3">
                <div className="nk-block-head-content">
                  <h3 className="nk-block-title page-title">{data?.name ?? "Ürün Detayı"}</h3>
                  <div className="nk-block-des text-soft">
                    <p>Kod: {data?.productCode ?? "-"}</p>
                  </div>
                </div>
                <div className="nk-block-head-content">
                  {id ? <Link to={`/products/${id}/edit`} className="btn btn-outline-primary">Düzenle</Link> : null}
                </div>
              </div>
            </div>
          </>
        )}
      </Content>
    </>
  );
};

export default ProductDetailPage;
