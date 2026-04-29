import React from "react";
import { Link } from "react-router-dom";
import Content from "@/layout/content/Content";
import Head from "@/layout/head/Head";
import Icon from "@/components/icon/Icon";
import { Block } from "@/components/Component";
import PageHeader from "@/modules/shared/components/PageHeader";
import EmptyState from "@/modules/shared/components/EmptyState";
import { useProducts } from "@/modules/products/hooks/useProducts";
import { useCategories, useSuppliers, useWarehouses } from "@/modules/catalog/hooks/useCatalog";
import { useInventories, useInventoryReservations } from "@/modules/inventory/hooks/useInventory";

interface StatCardProps {
  title: string;
  value: React.ReactNode;
  icon: string;
  color: string;
  to?: string;
  hint?: string;
  loading?: boolean;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color, to, hint, loading }) => {
  const inner = (
    <div className="card card-bordered h-100">
      <div className="card-inner">
        <div className="card-title-group align-start mb-2">
          <div className="card-title">
            <h6 className="title text-soft text-uppercase fs-12px mb-0">{title}</h6>
          </div>
          <div className="card-tools">
            <span className={`d-inline-flex align-items-center justify-content-center rounded-circle bg-${color}-soft text-${color}`} style={{ width: 36, height: 36 }}>
              <Icon name={icon} />
            </span>
          </div>
        </div>
        <div className="d-flex align-items-end justify-content-between">
          <div className="amount fs-2 fw-medium">
            {loading ? (
              <span className="placeholder col-3 placeholder-glow">
                <span className="placeholder col-12" />
              </span>
            ) : (
              value
            )}
          </div>
          {hint ? <span className="text-soft fs-12px">{hint}</span> : null}
        </div>
      </div>
    </div>
  );

  return to ? (
    <Link to={to} className="text-decoration-none text-reset">
      {inner}
    </Link>
  ) : (
    inner
  );
};

const QuickAction: React.FC<{ to: string; icon: string; label: string; color: string }> = ({
  to,
  icon,
  label,
  color,
}) => (
  <Link
    to={to}
    className="card card-bordered text-decoration-none text-reset h-100 quick-action-card"
  >
    <div className="card-inner d-flex align-items-center gap-3">
      <span className={`d-inline-flex align-items-center justify-content-center rounded-circle bg-${color}-soft text-${color}`} style={{ width: 44, height: 44 }}>
        <Icon name={icon} />
      </span>
      <div>
        <div className="fw-medium">{label}</div>
        <div className="text-soft fs-12px">Hızlı erişim</div>
      </div>
    </div>
  </Link>
);

const DashboardPage: React.FC = () => {
  const { data: products, isLoading: productsLoading } = useProducts({ pageSize: 5 });
  const { data: categories = [] } = useCategories();
  const { data: suppliers = [] } = useSuppliers();
  const { data: warehouses = [] } = useWarehouses();
  const { data: inventories = [] } = useInventories();
  const { data: reservations = [] } = useInventoryReservations();

  const lowStockCount = inventories.filter(
    (i) => i.reorderPoint && i.quantityAvailable <= i.reorderPoint
  ).length;
  const outOfStockCount = inventories.filter((i) => i.quantityAvailable <= 0).length;
  const activeReservations = reservations.filter((r) => r.status === 1).length;

  const recentProducts = products?.items?.slice(0, 5) ?? [];

  return (
    <>
      <Head title="Gösterge Paneli" />
      <Content>
        <PageHeader
          title="Gösterge Paneli"
          description="Ürün, stok ve katalog özetinize hızlıca göz atın."
          actions={
            <Link to="/products/new" className="btn btn-primary">
              <Icon name="plus" className="me-1" />
              Yeni Ürün
            </Link>
          }
        />

        <Block>
          <div className="row g-3">
            <div className="col-sm-6 col-xl-3">
              <StatCard
                title="Toplam Ürün"
                value={products?.totalCount ?? 0}
                icon="box"
                color="primary"
                to="/products"
                loading={productsLoading}
              />
            </div>
            <div className="col-sm-6 col-xl-3">
              <StatCard
                title="Kategoriler"
                value={categories.length}
                icon="layers"
                color="info"
                to="/catalog/categories"
              />
            </div>
            <div className="col-sm-6 col-xl-3">
              <StatCard
                title="Tedarikçiler"
                value={suppliers.length}
                icon="building"
                color="success"
                to="/catalog/suppliers"
              />
            </div>
            <div className="col-sm-6 col-xl-3">
              <StatCard
                title="Depolar"
                value={warehouses.length}
                icon="archive"
                color="warning"
                to="/catalog/warehouses"
              />
            </div>
          </div>
        </Block>

        <Block>
          <div className="row g-3">
            <div className="col-sm-6 col-xl-3">
              <StatCard
                title="Stoksuz Kalem"
                value={outOfStockCount}
                icon="alert-circle"
                color="danger"
                to="/inventory/stock"
                hint={outOfStockCount > 0 ? "Aksiyon gerekli" : "Sorun yok"}
              />
            </div>
            <div className="col-sm-6 col-xl-3">
              <StatCard
                title="Düşük Stok"
                value={lowStockCount}
                icon="alert"
                color="warning"
                to="/inventory/stock"
              />
            </div>
            <div className="col-sm-6 col-xl-3">
              <StatCard
                title="Aktif Rezervasyon"
                value={activeReservations}
                icon="lock-alt"
                color="info"
                to="/inventory/reservations"
              />
            </div>
            <div className="col-sm-6 col-xl-3">
              <StatCard
                title="Toplam Stok Hareketi"
                value={inventories.length}
                icon="exchange"
                color="primary"
                to="/inventory/transactions"
              />
            </div>
          </div>
        </Block>

        <Block>
          <div className="row g-3">
            <div className="col-lg-7">
              <div className="card card-bordered h-100">
                <div className="card-inner border-bottom">
                  <div className="card-title-group">
                    <div className="card-title">
                      <h6 className="title">Son Eklenen Ürünler</h6>
                    </div>
                    <div className="card-tools">
                      <Link to="/products" className="link link-primary">
                        Tümünü Gör <Icon name="chevron-right" />
                      </Link>
                    </div>
                  </div>
                </div>
                <div className="card-inner p-0">
                  {productsLoading ? (
                    <div className="card-inner d-flex align-items-center gap-2">
                      <span className="spinner-border spinner-border-sm text-primary" />
                      <span>Yükleniyor...</span>
                    </div>
                  ) : recentProducts.length === 0 ? (
                    <EmptyState
                      icon="box"
                      title="Ürün bulunamadı"
                      description="İlk ürününüzü oluşturarak başlayın."
                      action={
                        <Link to="/products/new" className="btn btn-primary">
                          <Icon name="plus" className="me-1" />
                          Yeni Ürün
                        </Link>
                      }
                    />
                  ) : (
                    <div className="nk-tb-list">
                      <div className="nk-tb-item nk-tb-head">
                        <div className="nk-tb-col"><span className="sub-text">Kod</span></div>
                        <div className="nk-tb-col"><span className="sub-text">Ad</span></div>
                        <div className="nk-tb-col"><span className="sub-text">Marka</span></div>
                        <div className="nk-tb-col tb-col-tools" />
                      </div>
                      {recentProducts.map((p) => (
                        <div key={p.id} className="nk-tb-item">
                          <div className="nk-tb-col">
                            <span className="fw-medium">{p.productCode}</span>
                          </div>
                          <div className="nk-tb-col">{p.name}</div>
                          <div className="nk-tb-col">
                            <span className="text-soft">{p.brand || "—"}</span>
                          </div>
                          <div className="nk-tb-col tb-col-tools">
                            <Link to={`/products/${p.id}`} className="btn btn-icon btn-trigger">
                              <Icon name="eye" />
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="col-lg-5">
              <div className="card card-bordered h-100">
                <div className="card-inner border-bottom">
                  <h6 className="title mb-0">Hızlı İşlemler</h6>
                </div>
                <div className="card-inner">
                  <div className="row g-2">
                    <div className="col-12">
                      <QuickAction to="/products/new" icon="plus" label="Yeni Ürün" color="primary" />
                    </div>
                    <div className="col-12">
                      <QuickAction
                        to="/catalog/categories/new"
                        icon="layers"
                        label="Yeni Kategori"
                        color="info"
                      />
                    </div>
                    <div className="col-12">
                      <QuickAction
                        to="/catalog/suppliers/new"
                        icon="building"
                        label="Yeni Tedarikçi"
                        color="success"
                      />
                    </div>
                    <div className="col-12">
                      <QuickAction
                        to="/inventory/transactions/new"
                        icon="exchange"
                        label="Stok Hareketi"
                        color="warning"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Block>
      </Content>
    </>
  );
};

export default DashboardPage;
