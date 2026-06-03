import { TractRecord, formatScore } from "../utils/tractData";

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
              <em>{tract.shap.positive[0] ?? "Primary SHAP driver unavailable"}</em>
            </span>
            <span className="list-score">{formatScore(tract.prospexScore)}</span>
          </button>
        </li>
      ))}
    </ol>
  );
}

export default TopTractsList;
