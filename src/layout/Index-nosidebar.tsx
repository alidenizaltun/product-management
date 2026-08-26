import React from "react";
import { Outlet } from "react-router-dom";
import Head from "./head/Head";

interface LayoutProps {
  title?: string;
}

const Layout: React.FC<LayoutProps> = ({ title }) => {
  return (
    <>
      <Head title={!title && 'Loading'} />
      <div className="nk-app-root">
        <div className="nk-wrap nk-wrap-nosidebar">
          <div className="nk-content">
            <Outlet />
          </div>
        </div>
      </div>
    </>
  );
};
export default Layout;
