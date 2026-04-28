import React, { useEffect, useRef } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { Spinner } from "reactstrap";
import { useAuthStore } from "@/application/stores";
import { config } from "@/infrastructure/config";

interface RouteGuardProps {
  children?: React.ReactNode;
}

export const AuthGuard: React.FC<RouteGuardProps> = ({ children }) => {
  const location = useLocation();
  const initialized = useRef(false);

  const { isAuthenticated, isLoading, initialize, getCurrentUser, user } = useAuthStore();

  useEffect(() => {
    if (!initialized.current) {
      initialized.current = true;
      initialize();
    }
  }, [initialize]);

  useEffect(() => {
    if (isAuthenticated && !user && !isLoading) {
      getCurrentUser();
    }
  }, [isAuthenticated, user, isLoading, getCurrentUser]);

  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "100vh" }}>
        <Spinner color="primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to={config.routes.login} state={{ from: location }} replace />;
  }

  return children ? <>{children}</> : <Outlet />;
};

export const GuestGuard: React.FC<RouteGuardProps> = ({ children }) => {
  const location = useLocation();
  const initialized = useRef(false);

  const { isAuthenticated, initialize } = useAuthStore();

  useEffect(() => {
    if (!initialized.current) {
      initialized.current = true;
      initialize();
    }
  }, [initialize]);

  if (isAuthenticated) {
    const from =
      (location.state as { from?: { pathname?: string } })?.from?.pathname ||
      config.routes.dashboard;

    return <Navigate to={from} replace />;
  }

  return children ? <>{children}</> : <Outlet />;
};

export default AuthGuard;
