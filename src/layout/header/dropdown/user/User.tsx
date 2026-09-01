import React, { useState } from "react";
import { DropdownToggle, DropdownMenu, Dropdown } from "reactstrap";
import { LinkList, LinkItem } from "@/components/links/Links";
import UserAvatar from "@/components/user/UserAvatar";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/application/stores/authStore";
import { useTheme, useThemeUpdate } from "@/layout/provider/Theme";
import { findUpper } from "@/utils/Utils";

const User = () => {
  const theme = useTheme();
  const themeUpdate = useThemeUpdate();
  const navigate = useNavigate();
  const { logout, user } = useAuthStore();
  const [open, setOpen] = useState(false);
  const toggle = () => {
    themeUpdate.sidebarHide();
    setOpen((prevState) => !prevState);
  };

  const handleLogout = async (ev) => {
    ev.preventDefault();
    try {
      await logout();
    } finally {
      navigate("/login", { replace: true });
    }
  };

  const displayName = user?.fullName || "Kullanıcı";
  const displayEmail = user?.email || "";
  const avatarText = findUpper(displayName);

  return (
    <Dropdown isOpen={open} className="user-dropdown" toggle={toggle}>
      <DropdownToggle
        tag="a"
        href="#toggle"
        className="dropdown-toggle"
        onClick={(ev) => {
          ev.preventDefault();
        }}
      >
        <UserAvatar text={avatarText} className="sm" />
      </DropdownToggle>
      <DropdownMenu end className="dropdown-menu-md dropdown-menu-s1">
        <div className="dropdown-inner user-card-wrap bg-lighter d-none d-md-block">
          <div className="user-card sm">
            <div className="user-avatar">
              <span>{avatarText}</span>
            </div>
            <div className="user-info">
              <span className="lead-text">{displayName}</span>
              {displayEmail ? <span className="sub-text">{displayEmail}</span> : null}
            </div>
          </div>
        </div>
        <div className="dropdown-inner">
          <LinkList>
            <li>
              <a
                className={`dark-switch ${theme.skin === "dark" ? "active" : ""}`}
                href="#"
                onClick={(ev) => {
                  ev.preventDefault();
                  themeUpdate.skin(theme.skin === "dark" ? "light" : "dark");
                }}
              >
                {theme.skin === "dark" ? (
                  <>
                    <em className="icon ni ni-sun"></em>
                    <span>Açık Mod</span>
                  </>
                ) : (
                  <>
                    <em className="icon ni ni-moon"></em>
                    <span>Koyu Mod</span>
                  </>
                )}
              </a>
            </li>
          </LinkList>
        </div>
        <div className="dropdown-inner">
          <LinkList>
            <LinkItem icon="signout" link="/login" onClick={handleLogout}>
              Çıkış Yap
            </LinkItem>
          </LinkList>
        </div>
      </DropdownMenu>
    </Dropdown>
  );
};

export default User;
