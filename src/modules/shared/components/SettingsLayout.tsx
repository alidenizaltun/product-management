import React from "react";
import { Row, Col } from "reactstrap";
import Icon from "@/components/icon/Icon";
import classnames from "classnames";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface SettingsSection {
  id: string;
  label: string;
  icon?: string;
  content: React.ReactNode;
}

/* ------------------------------------------------------------------ */
/*  SettingsLayout                                                     */
/* ------------------------------------------------------------------ */

interface SettingsLayoutProps {
  title: string;
  sections: SettingsSection[];
  activeSection: string;
  onSectionChange: (id: string) => void;
}

export const SettingsLayout: React.FC<SettingsLayoutProps> = ({
  title,
  sections,
  activeSection,
  onSectionChange,
}) => {
  const activeContent = sections.find((s) => s.id === activeSection)?.content;

  return (
    <div className="card card-bordered">
      <div className="card-inner">
        <h5 className="card-title mb-3">{title}</h5>
        <Row className="g-gs">
          <Col lg={3} md={4} className="d-none d-md-block">
            <ul className="nav link-list-menu border border-light round m-0">
              {sections.map((s) => (
                <li key={s.id}>
                  <a
                    href={`#${s.id}`}
                    className={classnames({ active: activeSection === s.id })}
                    onClick={(e) => {
                      e.preventDefault();
                      onSectionChange(s.id);
                    }}
                  >
                    {s.icon && <Icon name={s.icon} />}
                    <span>{s.label}</span>
                  </a>
                </li>
              ))}
            </ul>
          </Col>

          {/* Mobile tabs */}
          <Col xs={12} className="d-md-none mb-3">
            <ul className="nav nav-tabs nav-tabs-card flex-nowrap overflow-auto">
              {sections.map((s) => (
                <li key={s.id} className="nav-item flex-shrink-0">
                  <a
                    href={`#${s.id}`}
                    className={classnames("nav-link", {
                      active: activeSection === s.id,
                    })}
                    onClick={(e) => {
                      e.preventDefault();
                      onSectionChange(s.id);
                    }}
                  >
                    {s.icon && <Icon name={s.icon} className="me-1" />}
                    {s.label}
                  </a>
                </li>
              ))}
            </ul>
          </Col>

          <Col lg={9} md={8}>
            {activeContent}
          </Col>
        </Row>
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/*  SettingsCard                                                       */
/* ------------------------------------------------------------------ */

interface SettingsCardProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  divider?: boolean;
}

export const SettingsCard: React.FC<SettingsCardProps> = ({
  title,
  description,
  children,
  divider = true,
}) => (
  <div className={classnames({ "border-bottom pb-4 mb-4": divider })}>
    <h6 className="overline-title text-primary-dim mb-1">{title}</h6>
    {description && <p className="text-soft fs-13px mb-3">{description}</p>}
    {children}
  </div>
);
