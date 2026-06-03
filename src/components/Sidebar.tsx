import { useState } from "react";
import TopTractsList from "./TopTractsList";
import TractInfoCard from "./TractInfoCard";
import { CountyFilter, TractRecord, countyLabel } from "../utils/tractData";

type SidebarProps = {
  selectedCounty: CountyFilter;
  onCountyChange: (county: CountyFilter) => void;
  topTracts: TractRecord[];
  activeTract: TractRecord | null;
  selectedTract: TractRecord | null;
  onSelectTract: (tract: TractRecord) => void;
  isLoading: boolean;
  error: string | null;
};

const COUNTY_OPTIONS: CountyFilter[] = ["all", "miami-dade", "broward", "palm-beach"];
type SidebarTab = "selected" | "top";

function Sidebar({
  selectedCounty,
  onCountyChange,
  topTracts,
  activeTract,
  selectedTract,
  onSelectTract,
  isLoading,
  error,
}: SidebarProps) {
  const [activeTab, setActiveTab] = useState<SidebarTab>("selected");

  const handleSelectTopTract = (tract: TractRecord) => {
    onSelectTract(tract);
    setActiveTab("selected");
  };

  return (
    <aside className="sidebar">
      <section className="sidebar-section">
        <label className="field-label" htmlFor="county-select">
          County
        </label>
        <select
          id="county-select"
          value={selectedCounty}
          onChange={(event) => onCountyChange(event.target.value as CountyFilter)}
        >
          {COUNTY_OPTIONS.map((county) => (
            <option key={county} value={county}>
              {countyLabel(county)}
            </option>
          ))}
        </select>
      </section>

      {isLoading && <div className="status-card">Loading tract intelligence...</div>}
      {error && <div className="status-card error">{error}</div>}

      <section className="sidebar-tabs" aria-label="Prospex tract panels">
        <div className="tab-list" role="tablist" aria-label="Right panel views">
          <button
            className={activeTab === "selected" ? "active" : ""}
            type="button"
            role="tab"
            aria-selected={activeTab === "selected"}
            onClick={() => setActiveTab("selected")}
          >
            Selected Tract
          </button>
          <button
            className={activeTab === "top" ? "active" : ""}
            type="button"
            role="tab"
            aria-selected={activeTab === "top"}
            onClick={() => setActiveTab("top")}
          >
            Top 10 Tracts
          </button>
        </div>

        <div className="tab-panel" role="tabpanel">
          {activeTab === "selected" ? (
            <TractInfoCard tract={activeTract} />
          ) : (
            <section className="sidebar-section">
              <div className="section-heading">
                <p className="eyebrow">Ranked by Prospex Suitability Score</p>
                <h2>Top 10 Tracts</h2>
              </div>
              <TopTractsList
                tracts={topTracts}
                selectedTract={selectedTract}
                onSelectTract={handleSelectTopTract}
              />
            </section>
          )}
        </div>
      </section>
    </aside>
  );
}

export default Sidebar;
