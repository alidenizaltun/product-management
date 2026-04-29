import React from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Button } from "reactstrap";
import Content from "@/layout/content/Content";
import Head from "@/layout/head/Head";
import Icon from "@/components/icon/Icon";
import { Block } from "@/components/Component";
import PageHeader from "@/modules/shared/components/PageHeader";
import StatusBadge from "@/modules/shared/components/StatusBadge";
import { usePriceList, usePriceListItems } from "@/modules/pricing/hooks/usePricing";
import EmptyState from "@/modules/shared/components/EmptyState";

const InfoRow: React.FC<{ label: string; value?: React.ReactNode }> = ({ label, value }) => (
  <div className="profile-ud-list">
    <div className="profile-ud-item">
      <div className="profile-ud wider">
        <span className="profile-ud-label">{label}</span>
        <span className="profile-ud-value">{value ?? "—"}</span>
      </div>
    </div>
  </div>
);

const fmtDate = (iso?: string) => (iso ? new Date(iso).toLocaleString("tr-TR") : undefined);

const PriceListDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { data: priceList, isLoading } = usePriceList(id);
  const { data: items = [], isLoading: itemsLoading } = usePriceListItems(id);

  return (
    <>
      <Head title={priceList?.name ?? "Fiyat Listesi"} />
      <Content>
        <PageHeader
          title={priceList?.name ?? "Fiyat Listesi"}
          description={priceList ? `Kod: ${priceList.code}` : undefined}
          actions={
            <div className="d-flex gap-2">
              <Button color="light" onClick={() => navigate("/pricing/pricelists")}>
                <Icon name="arrow-left" className="me-1" />
                Geri
              </Button>
              {id ? (
                <Link to={`/pricing/pricelists/${id}/edit`} className="btn btn-primary">
                  <Icon name="edit" className="me-1" />
                  Düzenle
                </Link>
              ) : null}
            </div>
          }
        />
        <Block>
          {isLoading ? (
            <div className="card card-bordered">
              <div className="card-inner d-flex align-items-center gap-2">
                <span className="spinner-border spinner-border-sm text-primary" />
                <span>Yükleniyor...</span>
              </div>
            </div>
          ) : (
            <div className="row g-3">
              <div className="col-lg-6">
                <div className="card card-bordered h-100">
                  <div className="card-inner">
                    <div className="d-flex justify-content-between align-items-start mb-3">
                      <h6 className="overline-title text-primary mb-0">Genel Bilgiler</h6>
                      <StatusBadge active={priceList?.isActive} />
                    </div>
                    <InfoRow label="Kod" value={priceList?.code} />
                    <InfoRow label="Ad" value={priceList?.name} />
                    <InfoRow label="Para Birimi" value={priceList?.currencyCode} />
                    <InfoRow label="Satış Kanalı" value={priceList?.salesChannel} />
                    <InfoRow label="Müşteri Grubu" value={priceList?.customerGroupCode} />
                    <InfoRow label="Açıklama" value={priceList?.description} />
                  </div>
                </div>
              </div>

              <div className="col-lg-6">
                <div className="card card-bordered h-100">
                  <div className="card-inner">
                    <h6 className="overline-title text-primary mb-3">Geçerlilik</h6>
                    <InfoRow label="Başlangıç" value={fmtDate(priceList?.validFrom)} />
                    <InfoRow label="Bitiş" value={fmtDate(priceList?.validTo)} />
                    <InfoRow label="Oluşturulma" value={fmtDate(priceList?.createdAt)} />
                    <InfoRow label="Güncellenme" value={fmtDate(priceList?.updatedAt)} />
                  </div>
                </div>
              </div>

              <div className="col-12">
                <div className="card card-bordered">
                  <div className="card-inner border-bottom">
                    <h6 className="overline-title text-primary mb-0">Liste Kalemleri</h6>
                  </div>
                  <div className="card-inner">
                    {itemsLoading ? (
                      <div className="d-flex align-items-center gap-2">
                        <span className="spinner-border spinner-border-sm text-primary" />
                        <span>Yükleniyor...</span>
                      </div>
                    ) : items.length === 0 ? (
                      <EmptyState icon="clip" title="Kalem yok" description="Bu fiyat listesinde henüz ürün yok." />
                    ) : (
                      <div className="table-responsive">
                        <table className="table">
                          <thead>
                            <tr>
                              <th>Ürün</th>
                              <th>Tutar</th>
                              <th>Karşılaştırma</th>
                              <th>Min</th>
                              <th>Max</th>
                            </tr>
                          </thead>
                          <tbody>
                            {items.map((item) => (
                              <tr key={item.id}>
                                <td className="fw-medium">{item.productId}</td>
                                <td>
                                  {item.amount.toLocaleString("tr-TR")} {priceList?.currencyCode}
                                </td>
                                <td>
                                  {item.compareAtAmount
                                    ? `${item.compareAtAmount.toLocaleString("tr-TR")} ${priceList?.currencyCode}`
                                    : "—"}
                                </td>
                                <td>{item.minQuantity ?? "—"}</td>
                                <td>{item.maxQuantity ?? "—"}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </Block>
      </Content>
    </>
  );
};

export default PriceListDetailPage;
