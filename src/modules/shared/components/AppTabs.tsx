import React from "react";

export interface TabItem {
  id: string;
  label: string;
  content: React.ReactNode;
  badge?: number | string;
}

interface AppTabsProps {
  tabs: TabItem[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

const AppTabs: React.FC<AppTabsProps> = ({ tabs, activeTab, onTabChange }) => {
  return (
    <div className="card card-bordered">
      <div className="card-inner border-bottom">
        <ul className="nav nav-tabs card-header-tabs flex-wrap gap-2">
          {tabs.map((tab) => (
            <li key={tab.id} className="nav-item">
              <button
                type="button"
                className={`nav-link ${activeTab === tab.id ? "active" : ""}`}
                onClick={() => onTabChange(tab.id)}
              >
                {tab.label}
                {tab.badge ? <span className="badge bg-danger ms-2">{tab.badge}</span> : null}
              </button>
            </li>
          ))}
        </ul>
      </div>
      <div className="card-inner">
        {tabs.find((tab) => tab.id === activeTab)?.content}
      </div>
    </div>
  );
};

export default AppTabs;
