import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Alert, Spinner } from "reactstrap";
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
import { useAuthStore } from "@/application/stores/authStore";
import { config } from "@/infrastructure/config/appConfig";
import { RegisterFormData, registerSchema } from "./schemas";

const Register = () => {
  const [passState, setPassState] = useState(false);
  const [confirmPassState, setConfirmPassState] = useState(false);
  const navigate = useNavigate();

  const { register: registerUser, isLoading, error, clearError } = useAuthStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema) as any,
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phoneNumber: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onFormSubmit = async (data: RegisterFormData) => {
    clearError();
    try {
      const response = await registerUser({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phoneNumber: data.phoneNumber,
        password: data.password,
        confirmPassword: data.confirmPassword,
      });

      if (response.succeeded) {
        navigate(config.routes.success);
      }
    } catch {
      // Error is handled by the store.
    }
  };

  return (
    <>
      <Head title="Kayit Ol" />
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
              <BlockTitle tag="h4">Kayit Ol</BlockTitle>
              <BlockDes>
                <p>Product Manager icin yeni bir hesap olusturun.</p>
              </BlockDes>
            </BlockContent>
          </BlockHead>

          {error && (
            <Alert color="danger" className="alert-icon mb-3">
              <Icon name="alert-circle" /> {error}
            </Alert>
          )}

          <form className="is-alter" onSubmit={handleSubmit(onFormSubmit)}>
            <div className="form-group">
              <label className="form-label" htmlFor="firstName">
                Ad
              </label>
              <div className="form-control-wrap">
                <input
                  type="text"
                  id="firstName"
                  {...register("firstName")}
                  placeholder="Adinizi girin"
                  className={`form-control-lg form-control ${errors.firstName ? "is-invalid" : ""}`}
                  disabled={isLoading}
                />
                {errors.firstName && <span className="invalid">{errors.firstName.message}</span>}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="lastName">
                Soyad
              </label>
              <div className="form-control-wrap">
                <input
                  type="text"
                  id="lastName"
                  {...register("lastName")}
                  placeholder="Soyadinizi girin"
                  className={`form-control-lg form-control ${errors.lastName ? "is-invalid" : ""}`}
                  disabled={isLoading}
                />
                {errors.lastName && <span className="invalid">{errors.lastName.message}</span>}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="email">
                E-posta
              </label>
              <div className="form-control-wrap">
                <input
                  type="email"
                  id="email"
                  {...register("email")}
                  placeholder="E-posta adresinizi girin"
                  className={`form-control-lg form-control ${errors.email ? "is-invalid" : ""}`}
                  disabled={isLoading}
                />
                {errors.email && <span className="invalid">{errors.email.message}</span>}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="phoneNumber">
                Telefon (opsiyonel)
              </label>
              <div className="form-control-wrap">
                <input
                  type="text"
                  id="phoneNumber"
                  {...register("phoneNumber")}
                  placeholder="5xxxxxxxxx"
                  className={`form-control-lg form-control ${errors.phoneNumber ? "is-invalid" : ""}`}
                  disabled={isLoading}
                />
                {errors.phoneNumber && <span className="invalid">{errors.phoneNumber.message}</span>}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="password">
                Sifre
              </label>
              <div className="form-control-wrap">
                <a
                  href="#password"
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
                  type={passState ? "text" : "password"}
                  id="password"
                  {...register("password")}
                  placeholder="Sifrenizi girin"
                  className={`form-control-lg form-control ${errors.password ? "is-invalid" : ""}`}
                  disabled={isLoading}
                />
                {errors.password && <span className="invalid">{errors.password.message}</span>}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="confirmPassword">
                Sifre Tekrar
              </label>
              <div className="form-control-wrap">
                <a
                  href="#confirmPassword"
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
                  type={confirmPassState ? "text" : "password"}
                  id="confirmPassword"
                  {...register("confirmPassword")}
                  placeholder="Sifrenizi tekrar girin"
                  className={`form-control-lg form-control ${
                    errors.confirmPassword ? "is-invalid" : ""
                  }`}
                  disabled={isLoading}
                />
                {errors.confirmPassword && (
                  <span className="invalid">{errors.confirmPassword.message}</span>
                )}
              </div>
            </div>

            <div className="form-group">
              <Button type="submit" color="primary" size="lg" className="btn-block" disabled={isLoading}>
                {isLoading ? <Spinner size="sm" color="light" /> : "Kayit Ol"}
              </Button>
            </div>
          </form>

          <div className="form-note-s2 text-center pt-4">
            Zaten hesabin var mi? <Link to={config.routes.login}>Giris Yap</Link>
          </div>
        </PreviewCard>
      </Block>
      <AuthFooter />
    </>
  );
};

export default Register;
