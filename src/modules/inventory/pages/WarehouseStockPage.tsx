import React, { useMemo } from "react";
import Content from "@/layout/content/Content";
import Head from "@/layout/head/Head";
import { Block } from "@/components/Component";
import PageHeader from "@/modules/shared/components/PageHeader";
import EmptyState from "@/modules/shared/components/EmptyState";
import { useInventories } from "@/modules/inventory/hooks/useInventory";
import { useWarehouses } from "@/modules/catalog/hooks/useCatalog";

interface WarehouseSummary {
  id: string;
  code: string;
  name: string;
  productCount: number;
  totalOnHand: number;
  totalAvailable: number;
}

const WarehouseStockPage: React.FC = () => {
  const { data: inventories = [], isLoading } = useInventories();
  const { data: warehouses = [] } = useWarehouses();

  const summary: WarehouseSummary[] = useMemo(() => {
    return warehouses.map((wh) => {
      const items = inventories.filter((inv) => inv.warehouseId === wh.id);
      return {
        id: wh.id,
        code: wh.code,
        name: wh.name,
        productCount: items.length,
        totalOnHand: items.reduce((sum, it) => sum + (it.quantityOnHand ?? 0), 0),
        totalAvailable: items.reduce((sum, it) => sum + (it.quantityAvailable ?? 0), 0),
      };
    });
  }, [inventories, warehouses]);

  return (
    <>
      <Head title="Depo Bazlı Stok" />
      <Content>
        <PageHeader
          title="Depo Bazlı Stok"
          description="Her depodaki toplam stok özeti."
        />
        <Block>
          {isLoading ? (
            <div className="card card-bordered">
              <div className="card-inner d-flex align-items-center gap-2">
                <span className="spinner-border spinner-border-sm text-primary" />
                <span>Yükleniyor...</span>
              </div>
            </div>
          ) : summary.length === 0 ? (
            <div className="card card-bordered">
              <EmptyState
                icon="archive"
                title="Depo bulunamadı"
                description="Önce katalogda depo tanımlayın."
              />
            </div>
          ) : (
            <div className="row g-3">
              {summary.map((wh) => (
                <div key={wh.id} className="col-md-6 col-xl-4">
                  <div className="card card-bordered h-100">
                    <div className="card-inner">
                      <div className="card-title-group align-start mb-2">
                        <div className="card-title">
                          <h6 className="title">{wh.name}</h6>
                          <p className="text-soft fs-13px mb-0">{wh.code}</p>
                        </div>
                        <span className="badge badge-dim bg-primary">{wh.productCount} ürün</span>
                      </div>
                      <div className="row g-2 pt-2 border-top">
                        <div className="col-6">
                          <div className="text-soft fs-12px">Eldeki</div>
                          <div className="fs-5 fw-medium">{wh.totalOnHand}</div>
                        </div>
                        <div className="col-6">
                          <div className="text-soft fs-12px">Mevcut</div>
                          <div className={`fs-5 fw-medium ${wh.totalAvailable <= 0 ? "text-danger" : "text-success"}`}>
                            {wh.totalAvailable}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Block>
      </Content>
    </>
  );
};

export default WarehouseStockPage;
