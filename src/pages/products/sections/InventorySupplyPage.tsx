import React from "react";
import { Link } from "react-router-dom";
import ProductSectionPage from "@/pages/products/components/ProductSectionPage";
import InventoryTab from "@/pages/products/components/editor/InventoryTab";
import InventoryTransactionTab from "@/pages/products/components/editor/InventoryTransactionTab";
import InventoryReservationTab from "@/pages/products/components/editor/InventoryReservationTab";
import SupplierMultiSelect from "@/pages/products/components/editor/SupplierMultiSelect";

/**
 * Fiziksel Ürün İşlemleri > Stok ve Tedarik
 * Ürün Seçici yalnızca fiziksel ürünleri listeler. Sistem genelindeki tüm stok
 * hareketleri `Stok İşlemleri` altında kalır; bu sayfa seçili ürüne odaklanır.
 */
const InventorySupplyPage: React.FC = () => (
    <ProductSectionPage sectionKey="inventory-supply">
        {({ productId }) => (
            <>
                <section className="card card-bordered mb-4">
                    <div className="card-inner border-bottom d-flex justify-content-between align-items-start gap-3 flex-wrap">
                        <div>
                            <h5 className="title mb-1">Depo Bazlı Stok</h5>
                            <p className="text-soft mb-0">Eldeki, rezerve ve satılabilir stok durumunu depo bazında izleyin.</p>
                        </div>
                        <Link to={`/inventory/stock?productId=${productId}`} className="btn btn-outline-light btn-sm">
                            <em className="icon ni ni-external me-1" />
                            Sistem Geneli Stok Durumu
                        </Link>
                    </div>
                    <div className="card-inner">
                        <InventoryTab />
                    </div>
                </section>

                <section className="card card-bordered mb-4">
                    <div className="card-inner border-bottom d-flex justify-content-between align-items-start gap-3 flex-wrap">
                        <div>
                            <h5 className="title mb-1">Stok Hareketleri</h5>
                            <p className="text-soft mb-0">Giriş, çıkış, transfer ve düzeltme hareketlerini ürünle ilişkilendirin.</p>
                        </div>
                        <Link to={`/inventory/transactions?productId=${productId}`} className="btn btn-outline-light btn-sm">
                            <em className="icon ni ni-external me-1" />
                            Tüm Stok Hareketleri
                        </Link>
                    </div>
                    <div className="card-inner">
                        <InventoryTransactionTab />
                    </div>
                </section>

                <section className="card card-bordered mb-4">
                    <div className="card-inner border-bottom d-flex justify-content-between align-items-start gap-3 flex-wrap">
                        <div>
                            <h5 className="title mb-1">Rezervasyonlar</h5>
                            <p className="text-soft mb-0">Rezerve miktarları ve kaynak kayıtlarını takip edin.</p>
                        </div>
                        <Link to={`/inventory/reservations?productId=${productId}`} className="btn btn-outline-light btn-sm">
                            <em className="icon ni ni-external me-1" />
                            Tüm Rezervasyonlar
                        </Link>
                    </div>
                    <div className="card-inner">
                        <InventoryReservationTab />
                    </div>
                </section>

                <section className="card card-bordered">
                    <div className="card-inner border-bottom d-flex justify-content-between align-items-start gap-3 flex-wrap">
                        <div>
                            <h5 className="title mb-1">Tedarikçi Eşleştirmeleri</h5>
                            <p className="text-soft mb-0">
                                Tedarikçi ürün kodu, maliyet ve teslim süresi bilgilerini yönetin.
                            </p>
                        </div>
                        <Link to="/definitions/suppliers" className="btn btn-outline-light btn-sm">
                            <em className="icon ni ni-external me-1" />
                            Tedarikçi Tanımları
                        </Link>
                    </div>
                    <div className="card-inner">
                        <SupplierMultiSelect />
                    </div>
                </section>
            </>
        )}
    </ProductSectionPage>
);

export default InventorySupplyPage;
