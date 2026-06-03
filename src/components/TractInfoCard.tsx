import { TractRecord, formatMetric, formatScore } from "../utils/tractData";

type TractInfoCardProps = {
  tract: TractRecord | null;
};

function TractInfoCard({ tract }: TractInfoCardProps) {
  if (!tract) {
    return (
      <section className="info-card empty">
        <p className="eyebrow">Model Explanation</p>
        <h2>Hover a census tract</h2>
        <p>
          Move across the map or choose a top-ranked tract to inspect the score,
          GIS baseline, recent development signal, and SHAP drivers.
        </p>
      </section>
    );
  }

  return (
    <section className="info-card">
      <p className="eyebrow">{tract.countyName}</p>
      <h2>{tract.tractName}</h2>
      <p className="geoid">GEOID {tract.geoid}</p>

      <div className="score-block">
        <span>Prospex suitability</span>
        <strong>{formatScore(tract.prospexScore)}</strong>
      </div>

      <div className="metric-grid">
        <div>
          <span>GIS baseline</span>
          <strong>{formatScore(tract.gisScore)}</strong>
        </div>
        <div>
          <span>Recent construction</span>
          <strong>{formatMetric(tract.recentConstructionRate)}</strong>
        </div>
      </div>

      <div className="driver-block">
        <h3>Top positive SHAP drivers</h3>
        <DriverList drivers={tract.shap.positive} />
      </div>

      <div className="driver-block">
        <h3>Top negative SHAP drivers</h3>
        <DriverList drivers={tract.shap.negative} />
      </div>

      {tract.shap.unavailable && (
        <p className="shap-unavailable">SHAP explanation unavailable</p>
      )}
    </section>
  );
}

type DriverListProps = {
  drivers: string[];
};

function DriverList({ drivers }: DriverListProps) {
  if (drivers.length === 0) {
    return <p className="muted">SHAP explanation unavailable</p>;
  }

  return (
    <ol className="driver-list">
      {drivers.slice(0, 3).map((driver) => (
        <li key={driver}>{driver}</li>
      ))}
    </ol>
  );
}

export default TractInfoCard;
