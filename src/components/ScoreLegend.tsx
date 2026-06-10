export const SCORE_RANGES = [
  { label: "0 to 20", min: 0, max: 20, color: "#b2182b" },
  { label: "20 to 40", min: 20, max: 40, color: "#ef8a62" },
  { label: "40 to 60", min: 40, max: 60, color: "#f7f7f7" },
  { label: "60 to 80", min: 60, max: 80, color: "#67a9cf" },
  { label: "80 to 100", min: 80, max: 100, color: "#2166ac" },
];

export function scoreColor(score: number | null): string {
  if (score === null) {
    return "#9ca3af";
  }

  if (score >= 80) return SCORE_RANGES[4].color;
  if (score >= 60) return SCORE_RANGES[3].color;
  if (score >= 40) return SCORE_RANGES[2].color;
  if (score >= 20) return SCORE_RANGES[1].color;
  return SCORE_RANGES[0].color;
}

function ScoreLegend() {
  return (
    <div className="score-legend" aria-label="Prospex Suitability Score legend">
      <h2>Prospex Suitability Score</h2>
      {SCORE_RANGES.map((range) => (
        <div className="legend-row" key={range.label}>
          <span style={{ backgroundColor: range.color }} />
          <p>{range.label}</p>
        </div>
      ))}
      <div className="legend-row">
        <span style={{ backgroundColor: scoreColor(null) }} />
        <p>Unavailable</p>
      </div>
    </div>
  );
}

export default ScoreLegend;
