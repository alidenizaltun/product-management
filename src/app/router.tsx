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
import Login from "@/modules/auth/pages/Login";
import Register from "@/modules/auth/pages/Register";
import ForgotPassword from "@/modules/auth/pages/ForgotPassword";
import ResetPassword from "@/modules/auth/pages/ResetPassword";
import ConfirmEmail from "@/modules/auth/pages/ConfirmEmail";
import Success from "@/modules/auth/pages/Success";
import DashboardPage from "@/modules/dashboard/pages/DashboardPage";
import ProductListPage from "@/modules/products/pages/ProductListPage";
import ProductCreatePage from "@/modules/products/pages/ProductCreatePage";
import ProductDetailPage from "@/modules/products/pages/ProductDetailPage";
import GeneralInfoPage from "@/modules/products/pages/sections/GeneralInfoPage";
import ClassificationPage from "@/modules/products/pages/sections/ClassificationPage";
import MediaPage from "@/modules/products/pages/sections/MediaPage";
import AdvancedSettingsPage from "@/modules/products/pages/sections/AdvancedSettingsPage";
import VariantsPage from "@/modules/products/pages/sections/VariantsPage";
import InventorySupplyPage from "@/modules/products/pages/sections/InventorySupplyPage";
import ProductPricingPage from "@/modules/products/pages/sections/ProductPricingPage";
import PricingPage from "@/modules/products/pages/sections/PricingPage";
import ModulesPage from "@/modules/products/pages/sections/ModulesPage";
import CategoryListPage from "@/modules/catalog/pages/CategoryListPage";
import CategoryFormPage from "@/modules/catalog/pages/CategoryFormPage";
import CategoryDetailPage from "@/modules/catalog/pages/CategoryDetailPage";
import SupplierListPage from "@/modules/catalog/pages/SupplierListPage";
import SupplierFormPage from "@/modules/catalog/pages/SupplierFormPage";
import SupplierDetailPage from "@/modules/catalog/pages/SupplierDetailPage";
import WarehouseListPage from "@/modules/catalog/pages/WarehouseListPage";
import WarehouseFormPage from "@/modules/catalog/pages/WarehouseFormPage";
import WarehouseDetailPage from "@/modules/catalog/pages/WarehouseDetailPage";
import AttributeDefinitionListPage from "@/modules/attributes/pages/AttributeDefinitionListPage";
import AttributeDefinitionFormPage from "@/modules/attributes/pages/AttributeDefinitionFormPage";
import AttributeDefinitionDetailPage from "@/modules/attributes/pages/AttributeDefinitionDetailPage";
import {
  AttributeSetDetailPage,
  AttributeSetFormPage,
  AttributeSetListPage,
} from "@/modules/attributes/pages/AttributeSetPages";
import PriceListListPage from "@/modules/pricing/pages/PriceListListPage";
import PriceListFormPage from "@/modules/pricing/pages/PriceListFormPage";
import PriceListDetailPage from "@/modules/pricing/pages/PriceListDetailPage";
import CampaignRulesPage from "@/modules/pricing/pages/CampaignRulesPage";
import StockListPage from "@/modules/inventory/pages/StockListPage";
import StockTransactionListPage from "@/modules/inventory/pages/StockTransactionListPage";
import StockTransactionFormPage from "@/modules/inventory/pages/StockTransactionFormPage";
import StockTransactionDetailPage from "@/modules/inventory/pages/StockTransactionDetailPage";
import ReservationListPage from "@/modules/inventory/pages/ReservationListPage";
import ReservationDetailPage from "@/modules/inventory/pages/ReservationDetailPage";
import WarehouseStockPage from "@/modules/inventory/pages/WarehouseStockPage";
import { LoginAuditPage } from "@/modules/identity/pages/IdentityPages";
import UserListPage from "@/modules/identity/pages/UserListPage";
import UserFormPage from "@/modules/identity/pages/UserFormPage";
import UserDetailPage from "@/modules/identity/pages/UserDetailPage";
import RoleListPage from "@/modules/identity/pages/RoleListPage";
import RoleFormPage from "@/modules/identity/pages/RoleFormPage";
import RoleDetailPage from "@/modules/identity/pages/RoleDetailPage";
import PermissionMatrixPage from "@/modules/identity/pages/PermissionMatrixPage";
import { SystemAuditPage, SystemLogsPage } from "@/modules/system/pages/SystemPages";
import SystemSettingsPage from "@/modules/system/pages/SystemSettingsPage";
import SystemIntegrationsPage from "@/modules/system/pages/SystemIntegrationsPage";
import UnitDefinitionListPage from "@/modules/catalog/pages/UnitDefinitionListPage";
import UnitDefinitionFormPage from "@/modules/catalog/pages/UnitDefinitionFormPage";
import { getProductSection } from "@/modules/products/config/productSections";

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
                <Route path="product-info/media" element={<MediaPage />} />
                <Route path="product-info/advanced" element={<AdvancedSettingsPage />} />

                <Route path="physical-products/variants" element={<VariantsPage />} />
                <Route path="physical-products/inventory-supply" element={<InventorySupplyPage />} />

                <Route path="software-products/pricing" element={<PricingPage />} />
                <Route path="software-products/modules" element={<ModulesPage />} />

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
                <Route
                  path="software-products/pricing-units/*"
                  element={<PrefixRedirect from="/software-products/pricing-units" to="/software-products/pricing" />}
                />
                <Route
                  path="software-products/sales-plans/*"
                  element={<PrefixRedirect from="/software-products/sales-plans" to="/software-products/pricing" />}
                />
                <Route
                  path="software-products/pricing-rules/*"
                  element={<PrefixRedirect from="/software-products/pricing-rules" to="/software-products/pricing" />}
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
