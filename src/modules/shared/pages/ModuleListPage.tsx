import React from "react";
import { Link } from "react-router-dom";
import Content from "@/layout/content/Content";
import Head from "@/layout/head/Head";

interface ModuleListPageProps {
  title: string;
  description: string;
  createPath: string;
  detailPathSample?: string;
}

const ModuleListPage: React.FC<ModuleListPageProps> = ({ title, description, createPath, detailPathSample }) => {
  return (
    <>
      <Head title={title} />
      <Content>
        <div className="nk-block-head nk-block-head-sm">
          <div className="nk-block-between g-3">
            <div className="nk-block-head-content">
              <h3 className="nk-block-title page-title">{title}</h3>
              <div className="nk-block-des text-soft">
                <p>{description}</p>
              </div>
            </div>
            <div className="nk-block-head-content">
              <Link to={createPath} className="btn btn-primary">Yeni Kayıt</Link>
            </div>
          </div>
        </div>
        <div className="card card-bordered">
          <div className="card-inner">
            <p className="mb-2">Liste sayfası hazır.</p>
            {detailPathSample ? (
              <Link to={detailPathSample} className="btn btn-outline-primary btn-sm">Örnek detay sayfasına git</Link>
            ) : null}
          </div>
        </div>
      </Content>
    </>
  );
};

export default ModuleListPage;
