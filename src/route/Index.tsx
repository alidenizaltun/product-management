import React, { useEffect } from "react";
import { BrowserRouter, Navigate, Route, Routes, useLocation } from "react-router-dom";
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
import DashboardPage from "@/modules/dashboard/pages/DashboardPage";
import ProductListPage from "@/modules/products/pages/ProductListPage";
import ProductFormPage from "@/modules/products/pages/ProductFormPage";
import ProductDetailPage from "@/modules/products/pages/ProductDetailPage";
import {
  CategoryDetailPage,
  CategoryFormPage,
  CategoryListPage,
} from "@/modules/catalog/pages/CategoryPages";
import {
  SupplierDetailPage,
  SupplierFormPage,
  SupplierListPage,
} from "@/modules/catalog/pages/SupplierPages";
import {
  WarehouseDetailPage,
  WarehouseFormPage,
  WarehouseListPage,
} from "@/modules/catalog/pages/WarehousePages";
import {
  AttributeDefinitionDetailPage,
  AttributeDefinitionFormPage,
  AttributeDefinitionListPage,
  AttributeSetDetailPage,
  AttributeSetFormPage,
  AttributeSetListPage,
} from "@/modules/attributes/pages/AttributePages";
import {
  CampaignRulesPage,
  PriceListDetailPage,
  PriceListFormPage,
  PriceListListPage,
} from "@/modules/pricing/pages/PricingPages";
import {
  ReservationDetailPage,
  ReservationListPage,
  StockListPage,
  StockTransactionDetailPage,
  StockTransactionFormPage,
  StockTransactionListPage,
  WarehouseStockDetailPage,
} from "@/modules/inventory/pages/InventoryPages";
import {
  LoginAuditPage,
  PermissionMatrixPage,
  RoleDetailPage,
  RoleFormPage,
  RoleListPage,
  UserDetailPage,
  UserFormPage,
  UserListPage,
} from "@/modules/identity/pages/IdentityPages";
import {
  SystemAuditPage,
  SystemIntegrationsPage,
  SystemLogsPage,
  SystemSettingsPage,
} from "@/modules/system/pages/SystemPages";

const ScrollToTop = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return <>{children}</>;
};

const Pages = () => {
  return (
    <BrowserRouter>
      <ScrollToTop>
        <Routes>
          <Route element={<ThemeProvider />}>
            <Route element={<AuthGuard />}>
              <Route element={<Layout />}>
                <Route index element={<Navigate to="/dashboard" replace />} />

                <Route path="dashboard" element={<DashboardPage />} />

                <Route path="products" element={<ProductListPage />} />
                <Route path="products/new" element={<ProductFormPage />} />
                <Route path="products/:id" element={<ProductDetailPage />} />
                <Route path="products/:id/edit" element={<ProductFormPage />} />

                <Route path="catalog/categories" element={<CategoryListPage />} />
                <Route path="catalog/categories/new" element={<CategoryFormPage />} />
                <Route path="catalog/categories/:id/edit" element={<CategoryFormPage />} />
                <Route path="catalog/categories/:id" element={<CategoryDetailPage />} />

                <Route path="catalog/suppliers" element={<SupplierListPage />} />
                <Route path="catalog/suppliers/new" element={<SupplierFormPage />} />
                <Route path="catalog/suppliers/:id/edit" element={<SupplierFormPage />} />
                <Route path="catalog/suppliers/:id" element={<SupplierDetailPage />} />

                <Route path="catalog/warehouses" element={<WarehouseListPage />} />
                <Route path="catalog/warehouses/new" element={<WarehouseFormPage />} />
                <Route path="catalog/warehouses/:id/edit" element={<WarehouseFormPage />} />
                <Route path="catalog/warehouses/:id" element={<WarehouseDetailPage />} />

                <Route path="attributes/definitions" element={<AttributeDefinitionListPage />} />
                <Route path="attributes/definitions/new" element={<AttributeDefinitionFormPage />} />
                <Route path="attributes/definitions/:id/edit" element={<AttributeDefinitionFormPage />} />
                <Route path="attributes/definitions/:id" element={<AttributeDefinitionDetailPage />} />
                <Route path="attributes/sets" element={<AttributeSetListPage />} />
                <Route path="attributes/sets/new" element={<AttributeSetFormPage />} />
                <Route path="attributes/sets/:id/edit" element={<AttributeSetFormPage />} />
                <Route path="attributes/sets/:id" element={<AttributeSetDetailPage />} />

                <Route path="pricing/pricelists" element={<PriceListListPage />} />
                <Route path="pricing/pricelists/new" element={<PriceListFormPage />} />
                <Route path="pricing/pricelists/:id/edit" element={<PriceListFormPage />} />
                <Route path="pricing/pricelists/:id" element={<PriceListDetailPage />} />
                <Route path="pricing/campaign-rules" element={<CampaignRulesPage />} />

                <Route path="inventory/stock" element={<StockListPage />} />
                <Route path="inventory/transactions" element={<StockTransactionListPage />} />
                <Route path="inventory/transactions/new" element={<StockTransactionFormPage />} />
                <Route path="inventory/transactions/:id/edit" element={<StockTransactionFormPage />} />
                <Route path="inventory/transactions/:id" element={<StockTransactionDetailPage />} />
                <Route path="inventory/reservations" element={<ReservationListPage />} />
                <Route path="inventory/reservations/:id" element={<ReservationDetailPage />} />
                <Route path="inventory/warehouse-stock" element={<WarehouseStockDetailPage />} />

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
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Route>
          </Route>
        </Routes>
      </ScrollToTop>
    </BrowserRouter>
  );
};

export default Pages;
