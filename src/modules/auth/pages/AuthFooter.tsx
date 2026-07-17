import React from "react";
import { COPYRIGHT_TEXT } from "@/shared/config/branding";

const AuthFooter = () => {
  return (
    <div className="nk-footer nk-auth-footer-full">
      <div className="container wide-lg">
        <div className="nk-block-content text-center">
          <p className="text-soft mb-0">{COPYRIGHT_TEXT}</p>
        </div>
      </div>
    </div>
  );
};
export default AuthFooter;
