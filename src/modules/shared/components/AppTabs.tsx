import React, { useRef, useState, useEffect, useCallback } from "react";

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
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 1);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1);
  }, []);

  useEffect(() => {
    checkScroll();
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener("scroll", checkScroll, { passive: true });
    const ro = new ResizeObserver(checkScroll);
    ro.observe(el);
    return () => {
      el.removeEventListener("scroll", checkScroll);
      ro.disconnect();
    };
  }, [checkScroll, tabs.length]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const activeBtn = el.querySelector<HTMLElement>(".nav-link.active");
    if (activeBtn) {
      const elRect = el.getBoundingClientRect();
      const btnRect = activeBtn.getBoundingClientRect();
      if (btnRect.left < elRect.left || btnRect.right > elRect.right) {
        activeBtn.scrollIntoView({ inline: "center", block: "nearest", behavior: "smooth" });
      }
    }
  }, [activeTab]);

  const scroll = (dir: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: dir === "left" ? -200 : 200, behavior: "smooth" });
  };

  return (
    <div className="card card-bordered">
      <div className="card-header p-0 border-bottom-0 position-relative">
        {canScrollLeft && (
          <button
            type="button"
            className="position-absolute start-0 top-0 bottom-0 d-flex align-items-center px-1 border-0 bg-white"
            style={{ zIndex: 2, cursor: "pointer", boxShadow: "4px 0 8px rgba(0,0,0,.08)" }}
            onClick={() => scroll("left")}
            aria-label="Sola kaydır"
          >
            <em className="icon ni ni-chevron-left text-soft" />
          </button>
        )}
        <div
          ref={scrollRef}
          style={{
            overflowX: "auto",
            overflowY: "hidden",
            scrollbarWidth: "none",
            msOverflowStyle: "none",
            WebkitOverflowScrolling: "touch",
          }}
        >
          <ul className="nav nav-tabs nav-tabs-card flex-nowrap mb-0" style={{ minWidth: "max-content" }}>
            {tabs.map((tab) => (
              <li key={tab.id} className="nav-item">
                <button
                  type="button"
                  className={`nav-link px-3 py-3 text-nowrap${activeTab === tab.id ? " active" : ""}`}
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
        {canScrollRight && (
          <button
            type="button"
            className="position-absolute end-0 top-0 bottom-0 d-flex align-items-center px-1 border-0 bg-white"
            style={{ zIndex: 2, cursor: "pointer", boxShadow: "-4px 0 8px rgba(0,0,0,.08)" }}
            onClick={() => scroll("right")}
            aria-label="Sağa kaydır"
          >
            <em className="icon ni ni-chevron-right text-soft" />
          </button>
        )}
      </div>
      <div className="card-inner pt-4" style={{ overflow: "hidden" }}>
        {tabs.find((tab) => tab.id === activeTab)?.content}
      </div>
    </div>
  );
};

export default AppTabs;
