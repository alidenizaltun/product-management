import React, { useState } from "react";
import Content from "@/layout/content/Content";
import Head from "@/layout/head/Head";
import AppTabs, { TabItem } from "@/modules/shared/components/AppTabs";

interface ModuleDetailPageProps {
  title: string;
  tabs?: TabItem[];
}

const ModuleDetailPage: React.FC<ModuleDetailPageProps> = ({ title, tabs }) => {
  const [activeTab, setActiveTab] = useState(tabs?.[0]?.id ?? "general");

  return (
    <>
      <Head title={title} />
      <Content>
        <div className="nk-block-head nk-block-head-sm">
          <div className="nk-block-head-content">
            <h3 className="nk-block-title page-title">{title}</h3>
          </div>
        </div>
        {tabs?.length ? (
          <AppTabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />
        ) : (
          <div className="card card-bordered">
            <div className="card-inner">Detay sayfası hazır.</div>
          </div>
        )}
      </Content>
    </>
  );
};

export default ModuleDetailPage;
