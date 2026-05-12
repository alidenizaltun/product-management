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
      <div className="card-header p-0 border-bottom-0">
        <ul className="nav nav-tabs nav-tabs-card flex-wrap">
          {tabs.map((tab) => (
            <li key={tab.id} className="nav-item">
              <button
                type="button"
                className={`nav-link px-3 py-3${activeTab === tab.id ? " active" : ""}`}
                onClick={() => onTabChange(tab.id)}
              >
                {tab.label}
                {tab.badge != null ? (
                  <span className="badge bg-primary ms-1" style={{ fontSize: "10px" }}>
                    {tab.badge}
                  </span>
                ) : null}
              </button>
            </li>
          ))}
        </ul>
      </div>
      <div className="card-inner pt-4">
        {tabs.find((tab) => tab.id === activeTab)?.content}
      </div>
    </div>
  );
};

export default AppTabs;
