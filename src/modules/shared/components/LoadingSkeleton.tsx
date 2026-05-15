import React from "react";
import { Card, CardBody, Spinner, Row, Col } from "reactstrap";

// ─── Skeleton Base ───────────────────────────────────────────────────────────

interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  rounded?: boolean;
  circle?: boolean;
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  width = "100%",
  height = "1rem",
  rounded = false,
  circle = false,
  className = "",
}) => {
  const style: React.CSSProperties = {
    width: typeof width === "number" ? `${width}px` : width,
    height: typeof height === "number" ? `${height}px` : height,
    ...(circle ? { borderRadius: "50%" } : rounded ? { borderRadius: "0.25rem" } : {}),
  };

  return (
    <span
      className={`placeholder-glow d-inline-block ${className}`}
      style={style}
    >
      <span className="placeholder w-100 h-100 d-block" style={style} />
    </span>
  );
};

// ─── Table Skeleton ──────────────────────────────────────────────────────────

interface TableSkeletonProps {
  rows?: number;
  columns?: number;
  className?: string;
}

export const TableSkeleton: React.FC<TableSkeletonProps> = ({
  rows = 5,
  columns = 4,
  className = "",
}) => (
  <div className={`nk-tb-list nk-tb-ulist ${className}`}>
    <div className="nk-tb-item nk-tb-head">
      {Array.from({ length: columns }).map((_, colIdx) => (
        <div className="nk-tb-col" key={colIdx}>
          <span className="placeholder-glow">
            <span className="placeholder col-8" />
          </span>
        </div>
      ))}
    </div>
    {Array.from({ length: rows }).map((_, rowIdx) => (
      <div className="nk-tb-item" key={rowIdx}>
        {Array.from({ length: columns }).map((_, colIdx) => (
          <div className="nk-tb-col" key={colIdx}>
            <span className="placeholder-glow">
              <span
                className="placeholder"
                style={{ width: `${50 + ((rowIdx + colIdx) % 4) * 12}%` }}
              />
            </span>
          </div>
        ))}
      </div>
    ))}
  </div>
);

// ─── Card Skeleton ───────────────────────────────────────────────────────────

interface CardSkeletonProps {
  hasImage?: boolean;
  lines?: number;
  className?: string;
}

export const CardSkeleton: React.FC<CardSkeletonProps> = ({
  hasImage = false,
  lines = 3,
  className = "",
}) => (
  <Card className={`card-bordered ${className}`}>
    {hasImage && (
      <div className="placeholder-glow">
        <div
          className="placeholder w-100"
          style={{ height: 180, borderRadius: "4px 4px 0 0" }}
        />
      </div>
    )}
    <CardBody className="card-inner">
      <div className="placeholder-glow mb-3">
        <span className="placeholder col-6" style={{ height: "1.25rem" }} />
      </div>
      {Array.from({ length: lines }).map((_, i) => (
        <div className="placeholder-glow mb-2" key={i}>
          <span
            className="placeholder"
            style={{ width: i === lines - 1 ? "60%" : "100%" }}
          />
        </div>
      ))}
    </CardBody>
  </Card>
);

// ─── Form Skeleton ───────────────────────────────────────────────────────────

interface FormSkeletonProps {
  fields?: number;
  columns?: 1 | 2;
  className?: string;
}

export const FormSkeleton: React.FC<FormSkeletonProps> = ({
  fields = 4,
  columns = 1,
  className = "",
}) => {
  const fieldElements = Array.from({ length: fields }).map((_, i) => (
    <Col md={columns === 2 ? 6 : 12} key={i} className="mb-3">
      <div className="form-group">
        <div className="placeholder-glow mb-1">
          <span className="placeholder col-3" style={{ height: "0.75rem" }} />
        </div>
        <div className="placeholder-glow">
          <span
            className="placeholder col-12"
            style={{ height: "2.25rem", borderRadius: "4px" }}
          />
        </div>
      </div>
    </Col>
  ));

  return (
    <div className={className}>
      <Row className="g-3">{fieldElements}</Row>
      <div className="placeholder-glow mt-4">
        <span
          className="placeholder col-2"
          style={{ height: "2.25rem", borderRadius: "4px" }}
        />
      </div>
    </div>
  );
};

// ─── Detail Skeleton ─────────────────────────────────────────────────────────

interface DetailSkeletonProps {
  className?: string;
}

export const DetailSkeleton: React.FC<DetailSkeletonProps> = ({ className = "" }) => (
  <Row className={`g-gs ${className}`}>
    <Col lg={4}>
      <Card className="card-bordered">
        <CardBody className="card-inner">
          <div className="text-center mb-3 placeholder-glow">
            <span
              className="placeholder rounded-circle d-inline-block"
              style={{ width: 80, height: 80 }}
            />
          </div>
          {Array.from({ length: 4 }).map((_, i) => (
            <div className="placeholder-glow mb-2" key={i}>
              <span className="placeholder col-4 me-2" style={{ height: "0.7rem" }} />
              <span className="placeholder col-7" style={{ height: "0.7rem" }} />
            </div>
          ))}
        </CardBody>
      </Card>
    </Col>
    <Col lg={8}>
      <Card className="card-bordered">
        <CardBody className="card-inner">
          <div className="placeholder-glow mb-4">
            <span className="placeholder col-4" style={{ height: "1.5rem" }} />
          </div>
          {Array.from({ length: 6 }).map((_, i) => (
            <div className="placeholder-glow mb-2" key={i}>
              <span
                className="placeholder"
                style={{ width: i % 2 === 0 ? "100%" : "75%" }}
              />
            </div>
          ))}
          <div className="placeholder-glow mt-4 mb-3">
            <span className="placeholder col-3" style={{ height: "1.25rem" }} />
          </div>
          {Array.from({ length: 3 }).map((_, i) => (
            <div className="placeholder-glow mb-2" key={`s-${i}`}>
              <span className="placeholder col-5 me-3" />
              <span className="placeholder col-6" />
            </div>
          ))}
        </CardBody>
      </Card>
    </Col>
  </Row>
);

// ─── Stat Card Skeleton ──────────────────────────────────────────────────────

interface StatCardSkeletonProps {
  className?: string;
}

export const StatCardSkeleton: React.FC<StatCardSkeletonProps> = ({ className = "" }) => (
  <Card className={`card-bordered ${className}`}>
    <CardBody className="card-inner">
      <div className="d-flex align-items-center justify-content-between mb-2">
        <div className="placeholder-glow" style={{ width: "60%" }}>
          <span className="placeholder col-10" style={{ height: "0.75rem" }} />
        </div>
        <span className="placeholder-glow">
          <span
            className="placeholder rounded-circle"
            style={{ width: 36, height: 36 }}
          />
        </span>
      </div>
      <div className="placeholder-glow mb-1">
        <span className="placeholder col-5" style={{ height: "1.75rem" }} />
      </div>
      <div className="placeholder-glow">
        <span className="placeholder col-7" style={{ height: "0.65rem" }} />
      </div>
    </CardBody>
  </Card>
);

// ─── Page Skeleton ───────────────────────────────────────────────────────────

interface PageSkeletonProps {
  variant?: "list" | "detail" | "form" | "dashboard";
  className?: string;
}

export const PageSkeleton: React.FC<PageSkeletonProps> = ({
  variant = "list",
  className = "",
}) => {
  const header = (
    <div className="placeholder-glow mb-4">
      <span className="placeholder col-3" style={{ height: "1.5rem" }} />
      <span className="d-block mt-1 placeholder col-5" style={{ height: "0.75rem" }} />
    </div>
  );

  return (
    <div className={`nk-block ${className}`}>
      {header}

      {variant === "list" && (
        <Card className="card-bordered">
          <div className="card-inner position-relative card-tools-toggle">
            <div className="placeholder-glow d-flex justify-content-between">
              <span className="placeholder col-2" style={{ height: "2rem", borderRadius: 4 }} />
              <span className="placeholder col-1" style={{ height: "2rem", borderRadius: 4 }} />
            </div>
          </div>
          <CardBody className="p-0">
            <TableSkeleton rows={6} columns={5} />
          </CardBody>
        </Card>
      )}

      {variant === "detail" && <DetailSkeleton />}

      {variant === "form" && (
        <Card className="card-bordered">
          <CardBody className="card-inner">
            <FormSkeleton fields={6} columns={2} />
          </CardBody>
        </Card>
      )}

      {variant === "dashboard" && (
        <>
          <Row className="g-gs mb-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Col sm={6} xl={3} key={i}>
                <StatCardSkeleton />
              </Col>
            ))}
          </Row>
          <Row className="g-gs">
            <Col xl={8}>
              <Card className="card-bordered">
                <CardBody className="card-inner">
                  <div className="placeholder-glow mb-3">
                    <span className="placeholder col-4" style={{ height: "1.25rem" }} />
                  </div>
                  <Skeleton width="100%" height={220} rounded />
                </CardBody>
              </Card>
            </Col>
            <Col xl={4}>
              <Card className="card-bordered">
                <CardBody className="card-inner">
                  <div className="placeholder-glow mb-3">
                    <span className="placeholder col-5" style={{ height: "1.25rem" }} />
                  </div>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div className="placeholder-glow mb-2 d-flex align-items-center gap-2" key={i}>
                      <span className="placeholder rounded-circle" style={{ width: 32, height: 32, flexShrink: 0 }} />
                      <span className="placeholder flex-grow-1" />
                    </div>
                  ))}
                </CardBody>
              </Card>
            </Col>
          </Row>
        </>
      )}
    </div>
  );
};

// ─── Loading Overlay ─────────────────────────────────────────────────────────

interface LoadingOverlayProps {
  visible: boolean;
  text?: string;
  className?: string;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  visible,
  text,
  className = "",
}) => {
  if (!visible) return null;

  return (
    <div
      className={`position-absolute top-0 start-0 w-100 h-100 d-flex flex-column align-items-center justify-content-center ${className}`}
      style={{
        backgroundColor: "rgba(255,255,255,0.75)",
        zIndex: 10,
        backdropFilter: "blur(1px)",
      }}
    >
      <Spinner color="primary" />
      {text && <span className="mt-2 text-soft fs-14px">{text}</span>}
    </div>
  );
};

// ─── Inline Loading ──────────────────────────────────────────────────────────

interface InlineLoadingProps {
  text?: string;
  className?: string;
}

export const InlineLoading: React.FC<InlineLoadingProps> = ({
  text = "Yükleniyor...",
  className = "",
}) => (
  <div className={`d-inline-flex align-items-center gap-2 ${className}`}>
    <Spinner size="sm" color="primary" />
    <span className="text-soft">{text}</span>
  </div>
);
