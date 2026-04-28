import React, {useEffect} from "react";
import { Outlet } from "react-router-dom";
import menu from "./sidebar/MenuData";
import Appbar from "./appbar/Appbar";
import Sidebar from "./sidebar/Sidebar";
import Head from "./head/Head";
import Header from "./header/Header";
import Footer from "./footer/Footer";
import AppRoot from "./global/AppRoot";
import AppMain from "./global/AppMain";
import AppWrap from "./global/AppWrap";

const Layout = ({title, app, ...props}: { title?: string; app?: unknown }) => {  

  
  return (
      <>
        <Head title={!title && 'Loading'} />
        <AppRoot className="">
          <Appbar />
          <AppMain className="">
            <Sidebar menuData={menu} fixed className="" />
            <AppWrap className="">
              <Header fixed className="" />
              <Outlet />
              <Footer />
            </AppWrap>
          </AppMain>
        </AppRoot>
      </>
  );
};
export default Layout;
