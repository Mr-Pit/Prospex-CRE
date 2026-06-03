import {
  ShapDriver,
  TractRecord,
  formatScore,
  getPrimaryPositiveShapDriver,
} from "../utils/tractData";

type TopTractsListProps = {
  tracts: TractRecord[];
  selectedTract: TractRecord | null;
  onSelectTract: (tract: TractRecord) => void;
};

function TopTractsList({ tracts, selectedTract, onSelectTract }: TopTractsListProps) {
  if (tracts.length === 0) {
    return (
      <div className="status-card">
        No scored tracts available for this county. Add the GeoJSON file or check
        the score field names.
      </div>
    );
  }

  return (
    <ol className="top-tracts-list">
      {tracts.map((tract, index) => (
        <li key={tract.id}>
          <button
            className={tract.id === selectedTract?.id ? "active" : ""}
            type="button"
            onClick={() => onSelectTract(tract)}
          >
            <span className="rank">{index + 1}</span>
            <span className="tract-summary">
              <strong>{tract.tractName}</strong>
              <small>{tract.countyName}</small>
              <em>
                {formatPrimaryDriver(
                  getPrimaryPositiveShapDriver(tract.feature),
                )}
              </em>
            </span>
            <span className="list-score" aria-label="Prospex Suitability Score">
              <small>Prospex Suitability Score</small>
              {formatScore(tract.prospexScore)}
            </span>
          </button>
        </li>
      ))}
    </ol>
  );
}

function formatPrimaryDriver(driver: ShapDriver | null): string {
  if (!driver) {
    return "Primary SHAP driver unavailable";
  }

  if (driver.value === undefined) {
    return driver.name;
  }

  const sign = driver.value >= 0 ? "+" : "";
  return `${driver.name} (${sign}${driver.value.toFixed(3)})`;
}

export default TopTractsList;
