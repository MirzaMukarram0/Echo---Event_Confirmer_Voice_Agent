"use client";

import { useNavigation } from "../../lib/navigation";
import type { ScenarioInfo } from "../../lib/types";

interface SidebarProps {
  scenarios: ScenarioInfo[];
}

export default function Sidebar({ scenarios }: SidebarProps) {
  const {
    activeView,
    setView,
    activeCallId,
    isSidebarCollapsed,
    setSidebarCollapsed,
  } = useNavigation();

  const handleNavClick = (view: string) => {
    setView(view as any);
  };

  const activeClasses =
    "flex items-center gap-2.5 h-8 px-2.5 w-full rounded-md bg-v-active text-v-white text-sm font-medium cursor-pointer select-none";
  const inactiveClasses =
    "flex items-center gap-2.5 h-8 px-2.5 w-full rounded-md text-v-sub text-sm font-normal hover:bg-v-hover hover:text-v-text cursor-pointer select-none transition-colors duration-100";

  const sectionLabelClasses =
    "text-[11px] font-medium text-v-faint px-2.5 pt-5 pb-1 select-none";

  return (
    <aside
      className={`h-screen border-r border-v-border bg-v-base flex flex-col justify-between select-none transition-all duration-300 ${
        isSidebarCollapsed ? "w-[52px]" : "w-[240px]"
      }`}
    >
      <div className="flex flex-col flex-1 overflow-y-auto">
        {/* Brand Logo area */}
        <div className="h-12 flex items-center px-4 border-b border-v-border gap-2 font-semibold text-v-white text-sm">
          <span className="flex items-center justify-center w-5 h-5 rounded-full border border-v-white/20 bg-v-active">
            <span className="w-1.5 h-1.5 rounded-full bg-v-white animate-pulse-dot" />
          </span>
          {!isSidebarCollapsed && <span>ARIA</span>}
        </div>

        {/* Navigation list */}
        <nav className="flex-1 py-3 px-2 flex flex-col gap-0.5">
          {/* Overview */}
          <button
            type="button"
            onClick={() => handleNavClick("overview")}
            className={activeView === "overview" ? activeClasses : inactiveClasses}
            title={isSidebarCollapsed ? "Overview" : undefined}
          >
            <svg
              className="w-4 h-4 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z"
              />
            </svg>
            {!isSidebarCollapsed && <span>Overview</span>}
          </button>

          {/* Scenarios Section Header */}
          {isSidebarCollapsed ? (
            <div className="h-px bg-v-border my-2" />
          ) : (
            <div className={sectionLabelClasses}>Scenarios</div>
          )}

          {/* Dynamic Scenarios flat list */}
          {scenarios.map((scenario) => {
            const viewPath = `scenario/${scenario.id}`;
            const isActive = activeView === viewPath;
            return (
              <button
                key={scenario.id}
                type="button"
                onClick={() => handleNavClick(viewPath)}
                className={isActive ? activeClasses : inactiveClasses}
                title={isSidebarCollapsed ? scenario.label : undefined}
              >
                <svg
                  className="w-4 h-4 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.5}
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z"
                  />
                </svg>
                {!isSidebarCollapsed && (
                  <span className="truncate">{scenario.label}</span>
                )}
              </button>
            );
          })}

          {/* Monitoring Section Header */}
          {isSidebarCollapsed ? (
            <div className="h-px bg-v-border my-2" />
          ) : (
            <div className={sectionLabelClasses}>Monitoring</div>
          )}

          {/* Live Monitor */}
          <button
            type="button"
            onClick={() => handleNavClick("monitor")}
            className={activeView === "monitor" ? activeClasses : inactiveClasses}
            title={isSidebarCollapsed ? "Live Monitor" : undefined}
          >
            <svg
              className="w-4 h-4 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25M19.5 5.25a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25m15 0V15M4.5 5.25V15"
              />
            </svg>
            {!isSidebarCollapsed && (
              <span className="flex-1 text-left">Live Monitor</span>
            )}
            {activeCallId && (
              <span className="w-1.5 h-1.5 rounded-full bg-v-green animate-pulse-dot" />
            )}
          </button>

          {/* Interaction Logs */}
          <button
            type="button"
            onClick={() => handleNavClick("logs")}
            className={activeView === "logs" ? activeClasses : inactiveClasses}
            title={isSidebarCollapsed ? "Logs" : undefined}
          >
            <svg
              className="w-4 h-4 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25"
              />
            </svg>
            {!isSidebarCollapsed && <span>Logs</span>}
          </button>

          {/* System Section Header */}
          {isSidebarCollapsed ? (
            <div className="h-px bg-v-border my-2" />
          ) : (
            <div className={sectionLabelClasses}>System</div>
          )}

          {/* Settings */}
          <button
            type="button"
            onClick={() => handleNavClick("settings")}
            className={activeView === "settings" ? activeClasses : inactiveClasses}
            title={isSidebarCollapsed ? "Settings" : undefined}
          >
            <svg
              className="w-4 h-4 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.43l-1.003.828c-.293.241-.438.613-.43.992a7.723 7.723 0 010 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.43l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.991l-1.004-.827a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.645-.869l.214-1.28z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            {!isSidebarCollapsed && <span>Settings</span>}
          </button>
        </nav>
      </div>

      {/* Collapse Toggle Footer */}
      <div className="p-3 border-t border-v-border flex items-center justify-between">
        {!isSidebarCollapsed && (
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-v-active text-[10px] text-v-white font-semibold flex items-center justify-center select-none">
              MM
            </span>
            <span className="text-[11px] font-medium text-v-text">Mirza</span>
          </div>
        )}
        <button
          type="button"
          onClick={() => setSidebarCollapsed(!isSidebarCollapsed)}
          className={`h-7 w-7 flex items-center justify-center rounded hover:bg-v-hover text-v-muted hover:text-v-text transition-colors duration-100 ${
            isSidebarCollapsed ? "w-full" : ""
          }`}
        >
          <svg
            className={`w-3.5 h-3.5 transform transition-transform duration-300 ${
              isSidebarCollapsed ? "rotate-180" : ""
            }`}
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M18.75 19.5l-7.5-7.5 7.5-7.5m-6 15L5.25 12l7.5-7.5"
            />
          </svg>
        </button>
      </div>
    </aside>
  );
}
