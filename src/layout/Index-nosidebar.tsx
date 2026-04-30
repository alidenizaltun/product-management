import React, { useEffect } from "react";
import { Outlet } from "react-router-dom";

const LayoutNoSidebar = () => {
  useEffect(() => {
    const body = document.querySelector("body");
    if (body) {
      body.classList.remove("has-apps-sidebar", "has-sidebar");
    }
    return () => {
      const body = document.querySelector("body");
      if (body) {
        body.classList.add("has-apps-sidebar", "has-sidebar");
      }
    };
  }, []);

  return <Outlet />;
};

export default LayoutNoSidebar;
