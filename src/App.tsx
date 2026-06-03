import { useEffect, useMemo, useState } from "react";
import MapView from "./components/MapView";
import Sidebar from "./components/Sidebar";
import {
  CountyFilter,
  TractRecord,
  getTopTracts,
  loadTractData,
} from "./utils/tractData";

function App() {
  const [tracts, setTracts] = useState<TractRecord[]>([]);
  const [selectedCounty, setSelectedCounty] = useState<CountyFilter>("all");
  const [hoveredTract, setHoveredTract] = useState<TractRecord | null>(null);
  const [selectedTract, setSelectedTract] = useState<TractRecord | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadTractData()
      .then((records) => {
        setTracts(records);
        setError(null);
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : "Unable to load tract data.");
      })
      .finally(() => setIsLoading(false));
  }, []);

  const topTracts = useMemo(
    () => getTopTracts(tracts, selectedCounty),
    [selectedCounty, tracts],
  );

  const activeTract = hoveredTract ?? selectedTract;

  return (
    <div className="app-shell">
      <main className="map-region">
        <MapView
          tracts={tracts}
          selectedCounty={selectedCounty}
          hoveredTract={hoveredTract}
          selectedTract={selectedTract}
          onHoverTract={setHoveredTract}
          onSelectTract={setSelectedTract}
        />
        <div className="brand-bar">
          <div>
            <p className="eyebrow">Commercial Development Intelligence</p>
            <h1>Prospex CRE</h1>
          </div>
          <span className="tract-count">{tracts.length.toLocaleString()} tracts</span>
        </div>
      </main>

      <Sidebar
        selectedCounty={selectedCounty}
        onCountyChange={setSelectedCounty}
        topTracts={topTracts}
        activeTract={activeTract}
        selectedTract={selectedTract}
        onSelectTract={setSelectedTract}
        isLoading={isLoading}
        error={error}
      />
    </div>
  );
}

export default App;
