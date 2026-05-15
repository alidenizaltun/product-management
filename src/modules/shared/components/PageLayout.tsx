import React from "react";
import { Link } from "react-router-dom";
import { Button } from "reactstrap";
import Content from "@/layout/content/Content";
import Head from "@/layout/head/Head";
import Icon from "@/components/icon/Icon";
import { Block } from "@/components/Component";
import PageHeader from "./PageHeader";

// ─── Breadcrumb ───────────────────────────────────────────────────────────────

interface BreadcrumbItem {
  label: string;
  to?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

export const Breadcrumb: React.FC<BreadcrumbProps> = ({
  items,
  className = "",
}) => (
  <nav aria-label="breadcrumb" className={className}>
    <ol className="breadcrumb breadcrumb-sm mb-0">
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        return (
          <li
            key={`${item.label}-${index}`}
            className={`breadcrumb-item ${isLast ? "active" : ""}`}
            aria-current={isLast ? "page" : undefined}
          >
            {item.to && !isLast ? (
              <Link to={item.to} className="text-primary">
                {item.label}
              </Link>
            ) : (
              item.label
            )}
          </li>
        );
      })}
    </ol>
  </nav>
);

// ─── ListPage ─────────────────────────────────────────────────────────────────

interface ListPageProps {
  title: string;
  headTitle?: string;
  description?: string;
  breadcrumbs?: BreadcrumbItem[];
  createLabel?: string;
  createTo?: string;
  onCreate?: () => void;
  headerActions?: React.ReactNode;
  children: React.ReactNode;
}

export const ListPage: React.FC<ListPageProps> = ({
  title,
  headTitle,
  description,
  breadcrumbs,
  createLabel,
  createTo,
  onCreate,
  headerActions,
  children,
}) => (
  <>
    <Head title={headTitle ?? title} />
    <Content>
      {breadcrumbs && <Breadcrumb items={breadcrumbs} className="mb-2" />}
      <PageHeader
        title={title}
        description={description}
        actions={
          headerActions ?? (
            createTo || onCreate ? (
              createTo ? (
                <Link to={createTo} className="btn btn-primary">
                  <Icon name="plus" className="me-1" />
                  {createLabel ?? "Yeni Ekle"}
                </Link>
              ) : (
                <Button color="primary" onClick={onCreate}>
                  <Icon name="plus" className="me-1" />
                  {createLabel ?? "Yeni Ekle"}
                </Button>
              )
            ) : undefined
          )
        }
      />
      <Block>{children}</Block>
    </Content>
  </>
);

// ─── DetailPage ───────────────────────────────────────────────────────────────

interface DetailPageProps {
  title: string;
  headTitle?: string;
  subtitle?: string;
  breadcrumbs?: BreadcrumbItem[];
  badges?: React.ReactNode;
  loading?: boolean;
  error?: boolean;
  errorMessage?: string;
  onBack?: () => void;
  backTo?: string;
  onEdit?: () => void;
  editTo?: string;
  onDelete?: () => void;
  headerActions?: React.ReactNode;
  children: React.ReactNode;
}

export const DetailPage: React.FC<DetailPageProps> = ({
  title,
  headTitle,
  subtitle,
  breadcrumbs,
  badges,
  loading,
  error,
  errorMessage,
  onBack,
  backTo,
  onEdit,
  editTo,
  onDelete,
  headerActions,
  children,
}) => (
  <>
    <Head title={headTitle ?? title} />
    <Content>
      {breadcrumbs && <Breadcrumb items={breadcrumbs} className="mb-2" />}
      <PageHeader
        title={loading ? "Yükleniyor..." : title}
        description={subtitle}
        actions={
          headerActions ?? (
            !loading && !error ? (
              <div className="d-flex gap-2 align-items-center flex-wrap">
                {badges}
                {(editTo || onEdit) && (
                  editTo ? (
                    <Link to={editTo} className="btn btn-primary btn-sm">
                      <Icon name="edit" className="me-1" />
                      Düzenle
                    </Link>
                  ) : (
                    <Button color="primary" size="sm" onClick={onEdit}>
                      <Icon name="edit" className="me-1" />
                      Düzenle
                    </Button>
                  )
                )}
                {onDelete && (
                  <Button color="danger" outline size="sm" onClick={onDelete}>
                    <Icon name="trash" className="me-1" />
                    Sil
                  </Button>
                )}
              </div>
            ) : undefined
          )
        }
      />
      <Block>
        {loading ? (
          <div className="card card-bordered">
            <div className="card-inner d-flex align-items-center gap-3 py-5">
              <span className="spinner-border spinner-border-sm text-primary" />
              <span>Yükleniyor...</span>
            </div>
          </div>
        ) : error ? (
          <div className="card card-bordered">
            <div className="card-inner text-center py-5">
              <Icon name="cross-circle" className="fs-1 text-danger d-block mb-3" />
              <p className="text-soft mb-3">
                {errorMessage ?? "Kayıt bulunamadı veya yüklenirken bir hata oluştu."}
              </p>
              {(backTo || onBack) && (
                backTo ? (
                  <Link to={backTo} className="btn btn-light btn-sm">
                    <Icon name="arrow-left" className="me-1" />
                    Geri Dön
                  </Link>
                ) : (
                  <Button color="light" size="sm" onClick={onBack}>
                    <Icon name="arrow-left" className="me-1" />
                    Geri Dön
                  </Button>
                )
              )}
            </div>
          </div>
        ) : (
          children
        )}
      </Block>
    </Content>
  </>
);

// ─── FormPage ─────────────────────────────────────────────────────────────────

interface FormPageProps {
  title: string;
  headTitle?: string;
  subtitle?: string;
  breadcrumbs?: BreadcrumbItem[];
  loading?: boolean;
  saving?: boolean;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  submitLabel?: string;
  cancelLabel?: string;
  submitDisabled?: boolean;
  error?: string | null;
  children: React.ReactNode;
}

export const FormPage: React.FC<FormPageProps> = ({
  title,
  headTitle,
  subtitle,
  breadcrumbs,
  loading,
  saving,
  onSubmit,
  onCancel,
  submitLabel = "Kaydet",
  cancelLabel = "İptal",
  submitDisabled,
  error,
  children,
}) => (
  <>
    <Head title={headTitle ?? title} />
    <Content>
      {breadcrumbs && <Breadcrumb items={breadcrumbs} className="mb-2" />}
      <form onSubmit={onSubmit}>
        <PageHeader
          title={title}
          description={subtitle}
          actions={
            <div className="d-flex gap-2">
              <Button
                color="light"
                type="button"
                disabled={saving}
                onClick={onCancel}
                className="py-2"
              >
                {cancelLabel}
              </Button>
              <Button
                color="primary"
                type="submit"
                disabled={saving || submitDisabled}
                className="py-2"
              >
                {saving ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" />
                    Kaydediliyor...
                  </>
                ) : (
                  <>
                    <Icon name="save" className="me-1" />
                    {submitLabel}
                  </>
                )}
              </Button>
            </div>
          }
        />
        <Block>
          {error && (
            <div className="alert alert-danger d-flex align-items-center gap-2 mb-3">
              <Icon name="cross-circle" className="fs-5" />
              <span>{error}</span>
            </div>
          )}
          {loading ? (
            <div className="card card-bordered">
              <div className="card-inner d-flex align-items-center gap-3 py-5">
                <span className="spinner-border spinner-border-sm text-primary" />
                <span>Yükleniyor...</span>
              </div>
            </div>
          ) : (
            children
          )}
        </Block>
      </form>
    </Content>
  </>
);

// ─── TwoColumnLayout ──────────────────────────────────────────────────────────

interface TwoColumnLayoutProps {
  sidebar: React.ReactNode;
  sidebarWidth?: 3 | 4 | 5;
  sidebarPosition?: "left" | "right";
  children: React.ReactNode;
  className?: string;
}

export const TwoColumnLayout: React.FC<TwoColumnLayoutProps> = ({
  sidebar,
  sidebarWidth = 4,
  sidebarPosition = "left",
  children,
  className = "",
}) => {
  const mainWidth = 12 - sidebarWidth;
  const sidebarCol = (
    <div className={`col-lg-${sidebarWidth}`}>{sidebar}</div>
  );
  const mainCol = <div className={`col-lg-${mainWidth}`}>{children}</div>;

  return (
    <div className={`row g-4 ${className}`}>
      {sidebarPosition === "left" ? (
        <>
          {sidebarCol}
          {mainCol}
        </>
      ) : (
        <>
          {mainCol}
          {sidebarCol}
        </>
      )}
    </div>
  );
};

// ─── MetricRow ────────────────────────────────────────────────────────────────

interface MetricItem {
  label: string;
  value: React.ReactNode;
  icon?: string;
  color?: string;
}

interface MetricRowProps {
  items: MetricItem[];
  columns?: 2 | 3 | 4;
  className?: string;
}

export const MetricRow: React.FC<MetricRowProps> = ({
  items,
  columns = 4,
  className = "",
}) => {
  const colClass =
    columns === 2
      ? "col-sm-6"
      : columns === 3
        ? "col-sm-4"
        : "col-sm-6 col-xl-3";

  return (
    <div className={`row g-3 ${className}`}>
      {items.map((item) => (
        <div key={item.label} className={colClass}>
          <div className={`card card-bordered ${item.color ? `border-${item.color}` : ""}`}>
            <div className="card-inner py-3 text-center">
              {item.icon && (
                <Icon
                  name={item.icon}
                  className={`fs-2 text-${item.color ?? "primary"} d-block mb-1`}
                />
              )}
              <div className={`fs-2 fw-bold text-${item.color ?? "primary"}`}>
                {item.value}
              </div>
              <div className="text-soft fs-12">{item.label}</div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
