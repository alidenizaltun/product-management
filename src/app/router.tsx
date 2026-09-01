import React, { useEffect } from "react";
import {
  Navigate,
  Outlet,
  Route,
  RouterProvider,
  createBrowserRouter,
  createRoutesFromElements,
  useLocation,
  useParams,
} from "react-router-dom";
import Layout from "@/layout/Index";
import LayoutNoSidebar from "@/layout/Index-nosidebar";
import ThemeProvider from "@/layout/provider/Theme";
import { AuthGuard, GuestGuard } from "@/components/guards";
import Login from "@/pages/auth/Login";
import Register from "@/pages/auth/Register";
import ForgotPassword from "@/pages/auth/ForgotPassword";
import ResetPassword from "@/pages/auth/ResetPassword";
import ConfirmEmail from "@/pages/auth/ConfirmEmail";
import Success from "@/pages/auth/Success";
import DashboardPage from "@/pages/dashboard/DashboardPage";
import ProductListPage from "@/pages/products/ProductListPage";
import ProductCreatePage from "@/pages/products/ProductCreatePage";
import ProductDetailPage from "@/pages/products/ProductDetailPage";
import GeneralInfoPage from "@/pages/products/sections/GeneralInfoPage";
import ClassificationPage from "@/pages/products/sections/ClassificationPage";
import RegionsPage from "@/pages/products/sections/RegionsPage";
import MediaPage from "@/pages/products/sections/MediaPage";
import AdvancedSettingsPage from "@/pages/products/sections/AdvancedSettingsPage";
import VariantsPage from "@/pages/products/sections/VariantsPage";
import InventorySupplyPage from "@/pages/products/sections/InventorySupplyPage";
import ProductPricingPage from "@/pages/products/sections/ProductPricingPage";
import ModulesPage from "@/pages/products/sections/ModulesPage";
import CategoryListPage from "@/pages/catalog/CategoryListPage";
import CategoryFormPage from "@/pages/catalog/CategoryFormPage";
import CategoryDetailPage from "@/pages/catalog/CategoryDetailPage";
import SupplierListPage from "@/pages/catalog/SupplierListPage";
import SupplierFormPage from "@/pages/catalog/SupplierFormPage";
import SupplierDetailPage from "@/pages/catalog/SupplierDetailPage";
import WarehouseListPage from "@/pages/catalog/WarehouseListPage";
import WarehouseFormPage from "@/pages/catalog/WarehouseFormPage";
import WarehouseDetailPage from "@/pages/catalog/WarehouseDetailPage";
import AttributeDefinitionListPage from "@/pages/attributes/AttributeDefinitionListPage";
import AttributeDefinitionFormPage from "@/pages/attributes/AttributeDefinitionFormPage";
import AttributeDefinitionDetailPage from "@/pages/attributes/AttributeDefinitionDetailPage";
import {
  AttributeSetDetailPage,
  AttributeSetFormPage,
  AttributeSetListPage,
} from "@/pages/attributes/AttributeSetPages";
import PriceListListPage from "@/pages/pricing/PriceListListPage";
import PriceListFormPage from "@/pages/pricing/PriceListFormPage";
import PriceListDetailPage from "@/pages/pricing/PriceListDetailPage";
import CampaignRulesPage from "@/pages/pricing/CampaignRulesPage";
import PricingTemplateListPage from "@/pages/pricing/PricingTemplateListPage";
import PricingTemplateFormPage from "@/pages/pricing/PricingTemplateFormPage";
import PricingTemplateDetailPage from "@/pages/pricing/PricingTemplateDetailPage";
import PriceRevisionListPage from "@/pages/pricing/PriceRevisionListPage";
import PriceRevisionFormPage from "@/pages/pricing/PriceRevisionFormPage";
import PriceRevisionDetailPage from "@/pages/pricing/PriceRevisionDetailPage";
import StockListPage from "@/pages/inventory/StockListPage";
import StockTransactionListPage from "@/pages/inventory/StockTransactionListPage";
import StockTransactionFormPage from "@/pages/inventory/StockTransactionFormPage";
import StockTransactionDetailPage from "@/pages/inventory/StockTransactionDetailPage";
import ReservationListPage from "@/pages/inventory/ReservationListPage";
import ReservationDetailPage from "@/pages/inventory/ReservationDetailPage";
import WarehouseStockPage from "@/pages/inventory/WarehouseStockPage";
import { LoginAuditPage } from "@/pages/identity/IdentityPages";
import UserListPage from "@/pages/identity/UserListPage";
import UserFormPage from "@/pages/identity/UserFormPage";
import UserDetailPage from "@/pages/identity/UserDetailPage";
import RoleListPage from "@/pages/identity/RoleListPage";
import RoleFormPage from "@/pages/identity/RoleFormPage";
import RoleDetailPage from "@/pages/identity/RoleDetailPage";
import PermissionMatrixPage from "@/pages/identity/PermissionMatrixPage";
import { SystemAuditPage, SystemLogsPage } from "@/pages/system/SystemPages";
import SystemSettingsPage from "@/pages/system/SystemSettingsPage";
import SystemIntegrationsPage from "@/pages/system/SystemIntegrationsPage";
import UnitDefinitionListPage from "@/pages/catalog/UnitDefinitionListPage";
import UnitDefinitionFormPage from "@/pages/catalog/UnitDefinitionFormPage";
import RegionListPage from "@/pages/catalog/RegionListPage";
import RegionFormPage from "@/pages/catalog/RegionFormPage";
import { getProductSection } from "@/pages/products/config/productSections";

const ScrollToTop: React.FC = () => {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return <Outlet />;
};

/**
 * Eski adresleri yeni sabit adreslere taşır; yer imleri ve uygulama içindeki
 * eski bağlantılar 404'e düşmez.
 */
const PrefixRedirect: React.FC<{ from: string; to: string }> = ({ from, to }) => {
  const location = useLocation();
  const nextPath = `${to}${location.pathname.slice(from.length)}`;
  return <Navigate to={`${nextPath}${location.search}`} replace />;
};

/** Eski ürün düzenleme adresi; ürün artık sayfa içi Ürün Seçici ile taşınır. */
const ProductEditRedirect: React.FC = () => {
  const { id } = useParams();
  const target = getProductSection("general").path;
  return <Navigate to={id ? `${target}?productId=${id}` : target} replace />;
};

const routeTree = createRoutesFromElements(
  <Route element={<ScrollToTop />}>
    <Route element={<ThemeProvider />}>
      <Route element={<AuthGuard />}>
        <Route element={<Layout />}>
                <Route index element={<Navigate to="/products" replace />} />

                {/* ─── Ürün İşlemleri ─────────────────────────────────────── */}
                <Route path="products" element={<ProductListPage />} />
                <Route path="products/new" element={<ProductCreatePage />} />
                <Route path="products/:id" element={<ProductDetailPage />} />

                <Route path="product-info/general" element={<GeneralInfoPage />} />
                <Route path="product-info/classification" element={<ClassificationPage />} />
                <Route path="product-info/regions" element={<RegionsPage />} />
                <Route path="product-info/media" element={<MediaPage />} />
                <Route path="product-info/advanced" element={<AdvancedSettingsPage />} />

                <Route path="physical-products/variants" element={<VariantsPage />} />
                <Route path="physical-products/inventory-supply" element={<InventorySupplyPage />} />

                <Route path="software-products/modules" element={<ModulesPage />} />

                {/* Fiyatlandırma tüm ürün tipleri için ortak tek sayfadır. */}
                <Route path="pricing/product-pricing" element={<ProductPricingPage />} />

                {/* ─── Stok İşlemleri ─────────────────────────────────────── */}
                <Route path="inventory/stock" element={<StockListPage />} />
                <Route path="inventory/transactions" element={<StockTransactionListPage />} />
                <Route path="inventory/transactions/new" element={<StockTransactionFormPage />} />
                <Route path="inventory/transactions/:id/edit" element={<StockTransactionFormPage />} />
                <Route path="inventory/transactions/:id" element={<StockTransactionDetailPage />} />
                <Route path="inventory/reservations" element={<ReservationListPage />} />
                <Route path="inventory/reservations/:id" element={<ReservationDetailPage />} />
                <Route path="inventory/warehouse-stock" element={<WarehouseStockPage />} />

                {/* ─── Yönetim ve Tanımlar ────────────────────────────────── */}
                <Route path="definitions/categories" element={<CategoryListPage />} />
                <Route path="definitions/categories/new" element={<CategoryFormPage />} />
                <Route path="definitions/categories/:id/edit" element={<CategoryFormPage />} />
                <Route path="definitions/categories/:id" element={<CategoryDetailPage />} />

                <Route path="definitions/attributes" element={<AttributeDefinitionListPage />} />
                <Route path="definitions/attributes/new" element={<AttributeDefinitionFormPage />} />
                <Route path="definitions/attributes/:id/edit" element={<AttributeDefinitionFormPage />} />
                <Route path="definitions/attributes/:id" element={<AttributeDefinitionDetailPage />} />

                <Route path="definitions/attribute-sets" element={<AttributeSetListPage />} />
                <Route path="definitions/attribute-sets/new" element={<AttributeSetFormPage />} />
                <Route path="definitions/attribute-sets/:id/edit" element={<AttributeSetFormPage />} />
                <Route path="definitions/attribute-sets/:id" element={<AttributeSetDetailPage />} />

                <Route path="definitions/software-units" element={<UnitDefinitionListPage />} />
                <Route path="definitions/software-units/new" element={<UnitDefinitionFormPage />} />
                <Route path="definitions/software-units/:id/edit" element={<UnitDefinitionFormPage />} />

                <Route path="definitions/regions" element={<RegionListPage />} />
                <Route path="definitions/regions/new" element={<RegionFormPage />} />
                <Route path="definitions/regions/:id/edit" element={<RegionFormPage />} />

                <Route path="definitions/suppliers" element={<SupplierListPage />} />
                <Route path="definitions/suppliers/new" element={<SupplierFormPage />} />
                <Route path="definitions/suppliers/:id/edit" element={<SupplierFormPage />} />
                <Route path="definitions/suppliers/:id" element={<SupplierDetailPage />} />

                <Route path="definitions/warehouses" element={<WarehouseListPage />} />
                <Route path="definitions/warehouses/new" element={<WarehouseFormPage />} />
                <Route path="definitions/warehouses/:id/edit" element={<WarehouseFormPage />} />
                <Route path="definitions/warehouses/:id" element={<WarehouseDetailPage />} />

                <Route path="pricing/price-lists" element={<PriceListListPage />} />
                <Route path="pricing/price-lists/new" element={<PriceListFormPage />} />
                <Route path="pricing/price-lists/:id/edit" element={<PriceListFormPage />} />
                <Route path="pricing/price-lists/:id" element={<PriceListDetailPage />} />
                <Route path="pricing/templates" element={<PricingTemplateListPage />} />
                <Route path="pricing/templates/new" element={<PricingTemplateFormPage />} />
                <Route path="pricing/templates/:id" element={<PricingTemplateDetailPage />} />
                <Route path="pricing/templates/:id/edit" element={<PricingTemplateFormPage />} />
                <Route path="pricing/revisions" element={<PriceRevisionListPage />} />
                <Route path="pricing/revisions/new" element={<PriceRevisionFormPage />} />
                <Route path="pricing/revisions/:id" element={<PriceRevisionDetailPage />} />
                <Route path="pricing/revisions/:id/edit" element={<PriceRevisionFormPage />} />
                <Route path="pricing/campaign-rules" element={<CampaignRulesPage />} />

                <Route path="identity/users" element={<UserListPage />} />
                <Route path="identity/users/new" element={<UserFormPage />} />
                <Route path="identity/users/:id/edit" element={<UserFormPage />} />
                <Route path="identity/users/:id" element={<UserDetailPage />} />
                <Route path="identity/roles" element={<RoleListPage />} />
                <Route path="identity/roles/new" element={<RoleFormPage />} />
                <Route path="identity/roles/:id/edit" element={<RoleFormPage />} />
                <Route path="identity/roles/:id" element={<RoleDetailPage />} />
                <Route path="identity/permissions" element={<PermissionMatrixPage />} />
                <Route path="identity/login-audit" element={<LoginAuditPage />} />

                <Route path="system/settings" element={<SystemSettingsPage />} />
                <Route path="system/integrations" element={<SystemIntegrationsPage />} />
                <Route path="system/logs" element={<SystemLogsPage />} />
                <Route path="system/audit" element={<SystemAuditPage />} />

                {/* ─── Analiz ve Raporlama ────────────────────────────────── */}
                <Route path="analytics" element={<DashboardPage />} />

                {/* ─── Geriye dönük uyumluluk ─────────────────────────────── */}
                <Route path="dashboard" element={<Navigate to="/analytics" replace />} />
                <Route path="products/:id/edit" element={<ProductEditRedirect />} />
                <Route
                  path="catalog/categories/*"
                  element={<PrefixRedirect from="/catalog/categories" to="/definitions/categories" />}
                />
                <Route
                  path="catalog/suppliers/*"
                  element={<PrefixRedirect from="/catalog/suppliers" to="/definitions/suppliers" />}
                />
                <Route
                  path="catalog/warehouses/*"
                  element={<PrefixRedirect from="/catalog/warehouses" to="/definitions/warehouses" />}
                />
                <Route
                  path="catalog/unit-definitions/*"
                  element={<PrefixRedirect from="/catalog/unit-definitions" to="/definitions/software-units" />}
                />
                <Route
                  path="attributes/definitions/*"
                  element={<PrefixRedirect from="/attributes/definitions" to="/definitions/attributes" />}
                />
                <Route
                  path="attributes/sets/*"
                  element={<PrefixRedirect from="/attributes/sets" to="/definitions/attribute-sets" />}
                />
                <Route
                  path="pricing/pricelists/*"
                  element={<PrefixRedirect from="/pricing/pricelists" to="/pricing/price-lists" />}
                />
                {/* Yazılım fiyatlandırması ortak Fiyatlandırma sayfasında birleşti. */}
                <Route
                  path="software-products/pricing-units/*"
                  element={<PrefixRedirect from="/software-products/pricing-units" to="/pricing/product-pricing" />}
                />
                <Route
                  path="software-products/sales-plans/*"
                  element={<PrefixRedirect from="/software-products/sales-plans" to="/pricing/product-pricing" />}
                />
                <Route
                  path="software-products/pricing-rules/*"
                  element={<PrefixRedirect from="/software-products/pricing-rules" to="/pricing/product-pricing" />}
                />
                <Route
                  path="software-products/pricing/*"
                  element={<PrefixRedirect from="/software-products/pricing" to="/pricing/product-pricing" />}
                />

                <Route path="*" element={<Navigate to="/products" replace />} />
              </Route>
            </Route>

            <Route element={<LayoutNoSidebar />}>
              <Route element={<GuestGuard />}>
                <Route path="auth-success" element={<Success />} />
                <Route path="auth-reset" element={<ForgotPassword />} />
                <Route path="auth-register" element={<Register />} />
                <Route path="auth-login" element={<Login />} />
                <Route path="login" element={<Login />} />
                <Route path="register" element={<Register />} />
                <Route path="forgot-password" element={<ForgotPassword />} />
                <Route path="reset-password" element={<ResetPassword />} />
                <Route path="confirm-email" element={<ConfirmEmail />} />
              </Route>
            </Route>
          </Route>
        </Route>
);

const router = createBrowserRouter(routeTree);

const Pages = () => <RouterProvider router={router} />;

export default Pages;
