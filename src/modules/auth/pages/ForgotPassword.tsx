import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Alert } from "reactstrap";
import Logo from "@/images/logo.png";
import LogoDark from "@/images/logo.svg";
import Head from "@/layout/head/Head";
import AuthFooter from "./AuthFooter";
import {
  Block,
  BlockContent,
  BlockDes,
  BlockHead,
  BlockTitle,
  Button,
  Icon,
  PreviewCard,
} from "@/components/Component";
import { useAuthStore } from "@/modules/auth/stores/authStore";
import { config } from "@/shared/config/appConfig";
import { ForgotPasswordFormData, forgotPasswordSchema } from "@/modules/auth/schemas";

const ForgotPassword = () => {
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const { forgotPassword, isLoading, error, clearError } = useAuthStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema) as any,
    defaultValues: {
      email: "",
    },
  });

  const onFormSubmit = async (data: ForgotPasswordFormData) => {
    clearError();
    setSuccessMsg(null);

    try {
      await forgotPassword({ email: data.email });
      setSuccessMsg(
        "Eger e-posta adresi sistemde kayitliysa sifre sifirlama baglantisi gonderilecektir."
      );
    } catch {
      // Error is handled by store.
    }
  };

  return (
    <>
      <Head title="Sifremi Unuttum" />
      <Block className="nk-block-middle nk-auth-body wide-xs">
        <div className="brand-logo pb-4 text-center">
          <Link to="/" className="logo-link">
            <img className="logo-light logo-img logo-img-lg" src={Logo} alt="logo" />
            <img className="logo-dark logo-img logo-img-lg" src={LogoDark} alt="logo-dark" />
          </Link>
        </div>
        <PreviewCard className="card-bordered" bodyClass="card-inner-lg">
          <BlockHead>
            <BlockContent>
              <BlockTitle tag="h5">Sifre Sifirlama</BlockTitle>
              <BlockDes>
                <p>Sifre yenileme baglantisi almak icin e-posta adresinizi girin.</p>
              </BlockDes>
            </BlockContent>
          </BlockHead>

          {successMsg && (
            <Alert color="success" className="alert-icon mb-3">
              <Icon name="check-circle" /> {successMsg}
            </Alert>
          )}

          {error && (
            <Alert color="danger" className="alert-icon mb-3">
              <Icon name="alert-circle" /> {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit(onFormSubmit)}>
            <div className="form-group">
              <div className="form-label-group">
                <label className="form-label" htmlFor="email">
                  E-posta
                </label>
              </div>
              <input
                type="email"
                className={`form-control form-control-lg ${errors.email ? "is-invalid" : ""}`}
                id="email"
                placeholder="E-posta adresinizi girin"
                {...register("email")}
                disabled={isLoading}
              />
              {errors.email && <span className="invalid">{errors.email.message}</span>}
            </div>
            <div className="form-group">
              <Button color="primary" size="lg" className="btn-block" disabled={isLoading}>
                Baglanti Gonder
              </Button>
            </div>
          </form>
          <div className="form-note-s2 text-center pt-4">
            <Link to={config.routes.login}>
              <strong>Giris sayfasina don</strong>
            </Link>
          </div>
        </PreviewCard>
      </Block>
      <AuthFooter />
    </>
  );
};

export default ForgotPassword;
