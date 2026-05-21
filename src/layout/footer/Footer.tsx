import React from "react";
import { COPYRIGHT_TEXT } from "@/shared/config/branding";

const Footer = () => {
  return (
    <div className="nk-footer">
      <div className="container-fluid">
        <div className="nk-footer-wrap">
          <div className="nk-footer-copyright">{COPYRIGHT_TEXT}</div>
        </div>
      </div>
    </div>
  );
};
export default Footer;
