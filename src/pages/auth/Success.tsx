import React from "react";
import Logo from "@/images/logo.png";
import LogoDark from "@/images/logo.svg";
import Head from "@/layout/head/Head";
import AuthFooter from "./AuthFooter";
import { Block, BlockContent, BlockDes, BlockHead, BlockTitle } from "@/components/Component";
import { Link } from "react-router-dom";
import {Button} from "@/components/Component";
import { config } from "@/infrastructure/config";

const Success = () => {
  return (
    <>
      <Head title="Basarili" />
        <Block className="nk-block-middle nk-auth-body">
          <div className="brand-logo pb-5">
            <Link to="/" className="logo-link">
              <img className="logo-light logo-img logo-img-lg" src={Logo} alt="logo" />
              <img className="logo-dark logo-img logo-img-lg" src={LogoDark} alt="logo-dark" />
            </Link>
          </div>
          <BlockHead>
            <BlockContent>
              <BlockTitle tag="h4">Islem Basarili</BlockTitle>
              <BlockDes className="text-success">
                <p>Hesabiniz icin gerekli islem basariyla tamamlandi.</p>
                <Link to={config.routes.login}>
                  <Button color="primary" size="lg">
                    Giris Ekranina Don
                  </Button>
                </Link>
              </BlockDes>
            </BlockContent>
          </BlockHead>
        </Block>
        <AuthFooter />
    </>
  );
};
export default Success;

