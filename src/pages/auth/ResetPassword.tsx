import React, { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
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
import { ResetPasswordFormData, resetPasswordSchema } from "@/shared/validations";

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [passState, setPassState] = useState(false);
  const [confirmPassState, setConfirmPassState] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const emailFromQuery = searchParams.get("email") || "";
  const tokenFromQuery = searchParams.get("token") || "";

  const { resetPassword, isLoading, error, clearError } = useAuthStore();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema) as any,
    defaultValues: {
      email: emailFromQuery,
      token: tokenFromQuery,
      newPassword: "",
      confirmNewPassword: "",
    },
  });

  useEffect(() => {
    setValue("email", emailFromQuery);
    setValue("token", tokenFromQuery);
  }, [emailFromQuery, tokenFromQuery, setValue]);

  const onFormSubmit = async (data: ResetPasswordFormData) => {
    clearError();
    setSuccessMsg(null);
    try {
      const response = await resetPassword({
        email: data.email,
        token: data.token,
        newPassword: data.newPassword,
        confirmNewPassword: data.confirmNewPassword,
      });

      if (response.succeeded) {
        setSuccessMsg("Sifreniz basariyla guncellendi.");
        setTimeout(() => navigate(config.routes.success), 600);
      }
    } catch {
      // Error is handled by the store.
    }
  };

  return (
    <>
      <Head title="Sifre Sifirla" />
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
              <BlockTitle tag="h5">Yeni Sifre Belirle</BlockTitle>
              <BlockDes>
                <p>Hesabiniz icin yeni sifrenizi olusturun.</p>
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

          {!tokenFromQuery && (
            <Alert color="warning" className="alert-icon mb-3">
              <Icon name="alert-circle" /> Sifre sifirlama token bilgisi bulunamadi.
            </Alert>
          )}

          <form onSubmit={handleSubmit(onFormSubmit)}>
            <div className="form-group">
              <label className="form-label" htmlFor="email">
                E-posta
              </label>
              <input
                id="email"
                type="email"
                className={`form-control form-control-lg ${errors.email ? "is-invalid" : ""}`}
                {...register("email")}
                disabled={isLoading}
              />
              {errors.email && <span className="invalid">{errors.email.message}</span>}
            </div>

            <div className="form-group d-none">
              <input type="text" {...register("token")} />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="newPassword">
                Yeni Sifre
              </label>
              <div className="form-control-wrap">
                <a
                  href="#newPassword"
                  onClick={(ev) => {
                    ev.preventDefault();
                    setPassState(!passState);
                  }}
                  className={`form-icon lg form-icon-right passcode-switch ${
                    passState ? "is-hidden" : "is-shown"
                  }`}
                >
                  <Icon name="eye" className="passcode-icon icon-show" />
                  <Icon name="eye-off" className="passcode-icon icon-hide" />
                </a>
                <input
                  id="newPassword"
                  type={passState ? "text" : "password"}
                  className={`form-control form-control-lg ${errors.newPassword ? "is-invalid" : ""}`}
                  {...register("newPassword")}
                  disabled={isLoading}
                />
                {errors.newPassword && <span className="invalid">{errors.newPassword.message}</span>}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="confirmNewPassword">
                Yeni Sifre Tekrar
              </label>
              <div className="form-control-wrap">
                <a
                  href="#confirmNewPassword"
                  onClick={(ev) => {
                    ev.preventDefault();
                    setConfirmPassState(!confirmPassState);
                  }}
                  className={`form-icon lg form-icon-right passcode-switch ${
                    confirmPassState ? "is-hidden" : "is-shown"
                  }`}
                >
                  <Icon name="eye" className="passcode-icon icon-show" />
                  <Icon name="eye-off" className="passcode-icon icon-hide" />
                </a>
                <input
                  id="confirmNewPassword"
                  type={confirmPassState ? "text" : "password"}
                  className={`form-control form-control-lg ${
                    errors.confirmNewPassword ? "is-invalid" : ""
                  }`}
                  {...register("confirmNewPassword")}
                  disabled={isLoading}
                />
                {errors.confirmNewPassword && (
                  <span className="invalid">{errors.confirmNewPassword.message}</span>
                )}
              </div>
            </div>

            <div className="form-group">
              <Button color="primary" size="lg" className="btn-block" disabled={isLoading}>
                Sifreyi Guncelle
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

export default ResetPassword;
