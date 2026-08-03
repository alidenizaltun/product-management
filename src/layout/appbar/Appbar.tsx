import React from "react";
import LogoSmall from "@/images/logo-small-1.png";
import LogoDark from "@/images/logo-dark-small.png";
import SimpleBar from "simplebar-react";
import classNames from "classnames";
import { DropdownMenu, DropdownToggle, UncontrolledDropdown } from "reactstrap";
import { Link, useLocation } from "react-router";
import { UserAvatar, LinkList, LinkItem, Icon } from "@/components/Component";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/modules/auth/stores/authStore";
import { useTheme } from "@/layout/provider/Theme";
import { findUpper } from "@/utils/Utils";

/** Uygulamada tanımlı route'lara karşılık gelen kısayollar */
const appShortcuts = [
  { icon: "box", text: "Ürünler", link: "/products" },
  { icon: "dashboard", text: "Genel Bakış", link: "/analytics" },
];

const Appbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user } = useAuthStore();
  const avatarText = findUpper(user?.fullName || "K");
  const theme = useTheme();

  const handleLogout = async (ev: React.MouseEvent) => {
    ev.preventDefault();
    try {
      await logout();
    } finally {
      navigate("/login", { replace: true });
    }
  };

  const appSidebarClass = classNames({
    "nk-apps-sidebar": true,
    [`is-light`]: theme.appbar === "white",
    [`is-${theme.appbar}`]: theme.appbar !== "white" && theme.appbar !== "light",
  });

  const isActive = (path: string) =>
    location.pathname === path || location.pathname.startsWith(`${path}/`);

  return (
    <div className={appSidebarClass}>
      <div className="nk-apps-brand">
        <Link to="/products" className="logo-link">
          <img className="logo-light logo-img" src={LogoSmall} alt="logo" />
          <img className="logo-dark logo-img" src={LogoDark} alt="logo-dark" />
        </Link>
      </div>
      <div className="nk-sidebar-element">
        <div className="nk-sidebar-body">
          <SimpleBar className="nk-sidebar-content">
            <div className="nk-sidebar-menu">
              <ul className="nk-menu apps-menu">
                {appShortcuts.map((item) => (
                  <li
                    key={item.link}
                    className={`nk-menu-item ${isActive(item.link) ? "active current-page" : ""}`}
                    title={item.text}
                  >
                    <Link to={item.link} className="nk-menu-link">
                      <span className="nk-menu-icon">
                        <Icon name={item.icon} />
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div className="nk-sidebar-footer">
              <UncontrolledDropdown
                className="nk-sidebar-profile nk-sidebar-profile-fixed"
                direction="right"
              >
                <DropdownToggle
                  tag="a"
                  href="#toggle"
                  className="dropdown-toggle"
                  onClick={(ev) => ev.preventDefault()}
                >
                  <UserAvatar text={avatarText} theme="blue" />
                </DropdownToggle>
                <DropdownMenu end className="dropdown-menu-md ms-4">
                  <div className="dropdown-inner">
                    <LinkList>
                      <LinkItem icon="signout" link="/login" onClick={handleLogout}>
                        Çıkış Yap
                      </LinkItem>
                    </LinkList>
                  </div>
                </DropdownMenu>
              </UncontrolledDropdown>
            </div>
          </SimpleBar>
        </div>
      </div>
    </div>
  );
};

export default Appbar;
