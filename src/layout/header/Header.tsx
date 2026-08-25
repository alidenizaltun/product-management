import React from "react";
import classNames from "classnames";
import { Link } from "react-router-dom";
import LogoSvg from "@/images/logo.svg";
import Toggle from "../sidebar/Toggle";
import User from "./dropdown/user/User";
import { APP_COMPANY, APP_NAME } from "@/shared/config/branding";
import { useTheme, useThemeUpdate } from "@/layout/provider/Theme";

const Header = ({ fixed, className }) => {
  const theme = useTheme();
  const themeUpdate = useThemeUpdate();
  const headerClass = classNames({
    "nk-header": true,
    "nk-header-fixed": fixed,
    [`is-light`]: theme.header === "white",
    [`is-${theme.header}`]: theme.header !== "white" && theme.header !== "light",
    [`${className}`]: className,
  });

  return (
    <div className={headerClass}>
      <div className="container-fluid">
        <div className="nk-header-wrap">
          <div className="nk-menu-trigger d-xl-none ms-n1">
            <Toggle className="nk-nav-toggle nk-quick-nav-icon" icon="menu" click={themeUpdate.sidebarVisibility} />
          </div>
          <div className="nk-header-app-name">
            <div className="nk-header-app-logo">
              <Link to="/" className="logo-link">
                <img className="logo-img" src={LogoSvg} alt="logo" />
              </Link>
            </div>
            <div className="nk-header-app-info">
              <span className="sub-text">{APP_COMPANY}</span>
              <span className="lead-text">{APP_NAME}</span>
            </div>
          </div>
          <div className="nk-header-tools">
            <ul className="nk-quick-nav">
              <li className="user-dropdown">
                <User />
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Header;
