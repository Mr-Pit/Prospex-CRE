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

      <TractInfoCard tract={activeTract} />

      <section className="sidebar-section">
        <div className="section-heading">
          <p className="eyebrow">Ranked by Prospex score</p>
          <h2>Top 10 Tracts</h2>
        </div>
        <TopTractsList
          tracts={topTracts}
          selectedTract={selectedTract}
          onSelectTract={onSelectTract}
        />
      </section>
    </aside>
  );
}

export default Sidebar;
