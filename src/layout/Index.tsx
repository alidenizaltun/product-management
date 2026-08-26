import React from "react";
import { Outlet } from "react-router-dom";
import menu from "./sidebar/MenuData";
import Sidebar from "./sidebar/Sidebar";
import Head from "./head/Head";
import Header from "./header/Header";
import Footer from "./footer/Footer";
import AppRoot from "./global/AppRoot";
import AppMain from "./global/AppMain";
import AppWrap from "./global/AppWrap";

interface LayoutProps {
  title?: string;
  app?: {
    icon?: string;
    theme?: string;
    text?: string;
  };
}

const Layout: React.FC<LayoutProps> = ({ title }) => {
  return (
      <>
        <Head title={!title && 'Loading'} />
        <AppRoot>
          <AppMain>
            <Sidebar menuData={menu} fixed />
            <AppWrap>
              <Header fixed />
              <Outlet />
              <Footer />
            </AppWrap>
          </AppMain>
        </AppRoot>
      </>
  );
};
export default Layout;
