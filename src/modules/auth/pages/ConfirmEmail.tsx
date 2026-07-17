import React, { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Alert, Spinner } from "reactstrap";
import { Block, BlockContent, BlockTitle, Icon } from "@/components/Component";
import Head from "@/layout/head/Head";
import { useAuthStore } from "@/modules/auth/stores/authStore";
import { config } from "@/shared/config/appConfig";

const ConfirmEmail = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  const { confirmEmail } = useAuthStore();

  useEffect(() => {
    const token = searchParams.get("token");
    const userId = searchParams.get("userId");

    if (!token || !userId) {
      setStatus("error");
      setMessage("Gecersiz onay baglantisi.");
      return;
    }

    const runConfirmEmail = async () => {
      try {
        await confirmEmail(userId, token);
        setStatus("success");
        setMessage("E-posta adresiniz basariyla onaylandi. Artik giris yapabilirsiniz.");
      } catch {
        setStatus("error");
        setMessage("E-posta onayi basarisiz oldu. Baglantinin suresi dolmus olabilir.");
      }
    };

    runConfirmEmail();
  }, [confirmEmail, searchParams]);

  return (
    <>
      <Head title="E-posta Onayi" />
      <Block className="nk-block-middle nk-auth-body wide-xs">
        <BlockContent className="text-center">
          {status === "loading" && (
            <div>
              <Spinner color="primary" className="mb-3" />
              <BlockTitle tag="h4">E-posta Onaylaniyor...</BlockTitle>
              <p>Lutfen bekleyin.</p>
            </div>
          )}

          {status === "success" && (
            <div>
              <div className="mb-3">
                <Icon name="check-circle" className="text-success" style={{ fontSize: 48 }} />
              </div>
              <BlockTitle tag="h4">Basarili</BlockTitle>
              <Alert color="success">{message}</Alert>
              <Link to={config.routes.login} className="btn btn-primary btn-lg mt-3">
                Giris Yap
              </Link>
            </div>
          )}

          {status === "error" && (
            <div>
              <div className="mb-3">
                <Icon name="cross-circle" className="text-danger" style={{ fontSize: 48 }} />
              </div>
              <BlockTitle tag="h4">Hata</BlockTitle>
              <Alert color="danger">{message}</Alert>
              <Link to={config.routes.login} className="btn btn-primary btn-lg mt-3">
                Giris Sayfasina Don
              </Link>
            </div>
          )}
        </BlockContent>
      </Block>
    </>
  );
};

export default ConfirmEmail;
