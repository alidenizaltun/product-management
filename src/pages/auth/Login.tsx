import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Alert, Form, Spinner } from "reactstrap";
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
import { useAuthStore } from "@/application/stores";
import { config } from "@/infrastructure/config";
import { LoginFormData, loginSchema } from "@/shared/validations";

const Login = () => {
  const [passState, setPassState] = useState(false);
  const navigate = useNavigate();

  const { login, isLoading, error, clearError } = useAuthStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema) as any,
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  const onFormSubmit = async (data: LoginFormData) => {
    clearError();
    try {
      const response = await login({
        email: data.email,
        password: data.password,
        rememberMe: data.rememberMe,
      });

      if (response.succeeded) {
        navigate(config.routes.dashboard);
      }
    } catch {
      // Error is handled by the store.
    }
  };

  return (
    <>
      <Head title="Giris Yap" />
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
              <BlockTitle tag="h4">Giris Yap</BlockTitle>
              <BlockDes>
                <p>E-posta ve sifreniz ile Product Manager'a erisin.</p>
              </BlockDes>
            </BlockContent>
          </BlockHead>

          {error && (
            <div className="mb-3">
              <Alert color="danger" className="alert-icon">
                <Icon name="alert-circle" /> {error}
              </Alert>
            </div>
          )}

          <Form className="is-alter" onSubmit={handleSubmit(onFormSubmit)}>
            <div className="form-group">
              <div className="form-label-group">
                <label className="form-label" htmlFor="email">
                  E-posta
                </label>
              </div>
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
              <div className="form-label-group">
                <label className="form-label" htmlFor="password">
                  Sifre
                </label>
                <Link className="link link-primary link-sm" to={config.routes.forgotPassword}>
                  Sifremi Unuttum?
                </Link>
              </div>
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
                  className={`form-control-lg form-control ${
                    passState ? "is-hidden" : "is-shown"
                  } ${errors.password ? "is-invalid" : ""}`}
                  disabled={isLoading}
                />
                {errors.password && <span className="invalid">{errors.password.message}</span>}
              </div>
            </div>

            <div className="form-group">
              <div className="custom-control custom-control-xs custom-checkbox">
                <input
                  type="checkbox"
                  className="custom-control-input"
                  id="rememberMe"
                  {...register("rememberMe")}
                  disabled={isLoading}
                />
                <label className="custom-control-label" htmlFor="rememberMe">
                  Beni hatirla
                </label>
              </div>
            </div>

            <div className="form-group">
              <Button size="lg" className="btn-block" type="submit" color="primary" disabled={isLoading}>
                {isLoading ? <Spinner size="sm" color="light" /> : "Giris Yap"}
              </Button>
            </div>
          </Form>

          <div className="form-note-s2 text-center pt-4">
            Hesabin yok mu? <Link to={config.routes.register}>Kayit ol</Link>
          </div>
        </PreviewCard>
      </Block>
      <AuthFooter />
    </>
  );
};

export default Login;
