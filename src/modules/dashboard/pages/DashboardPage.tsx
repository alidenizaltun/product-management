import React from "react";
import Content from "@/layout/content/Content";
import Head from "@/layout/head/Head";

const DashboardPage: React.FC = () => {
  return (
    <>
      <Head title="Dashboard" />
      <Content>
        <div className="nk-block-head nk-block-head-sm">
          <div className="nk-block-head-content">
            <h3 className="nk-block-title page-title">Dashboard</h3>
            <div className="nk-block-des text-soft">
              <p>Genel Bakış, Son İşlemler ve Uyarılar</p>
            </div>
          </div>
        </div>
        <div className="card card-bordered">
          <div className="card-inner">Product Management yönetim paneli ana ekranı.</div>
        </div>
      </Content>
    </>
  );
};

export default DashboardPage;
