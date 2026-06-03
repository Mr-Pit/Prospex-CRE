import { useEffect, useMemo } from "react";
import L from "leaflet";
import { GeoJSON, MapContainer, TileLayer, useMap } from "react-leaflet";
import ScoreLegend, { scoreColor } from "./ScoreLegend";
import { CountyFilter, FeatureCollection, TractRecord, formatScore } from "../utils/tractData";

type MapViewProps = {
  tracts: TractRecord[];
  selectedCounty: CountyFilter;
  hoveredTract: TractRecord | null;
  selectedTract: TractRecord | null;
  onHoverTract: (tract: TractRecord | null) => void;
  onSelectTract: (tract: TractRecord) => void;
};

const DEFAULT_CENTER: L.LatLngExpression = [26.2, -80.45];
const DEFAULT_ZOOM = 9;

function MapView({
  tracts,
  selectedCounty,
  hoveredTract,
  selectedTract,
  onHoverTract,
  onSelectTract,
}: MapViewProps) {
  const featureLookup = useMemo(
    () => new Map(tracts.map((tract) => [tract.id, tract])),
    [tracts],
  );

  const featureCollection = useMemo<FeatureCollection>(
    () => ({
      type: "FeatureCollection",
      features: tracts.map((tract) => tract.feature),
    }),
    [tracts],
  );

  return (
    <MapContainer
      className="prospex-map"
      center={DEFAULT_CENTER}
      zoom={DEFAULT_ZOOM}
      scrollWheelZoom
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {tracts.length > 0 && (
        <GeoJSON
          key={`${hoveredTract?.id ?? "none"}-${selectedTract?.id ?? "none"}`}
          data={featureCollection}
          style={(feature) => {
            const tract = feature?.id ? featureLookup.get(String(feature.id)) : undefined;
            const isHovered = tract?.id === hoveredTract?.id;
            const isSelected = tract?.id === selectedTract?.id;

            return {
              color: isHovered || isSelected ? "#101820" : "#ffffff",
              fillColor: scoreColor(tract?.prospexScore ?? null),
              fillOpacity: isHovered || isSelected ? 0.88 : 0.68,
              opacity: isHovered || isSelected ? 1 : 0.75,
              weight: isHovered || isSelected ? 2.2 : 0.7,
            };
          }}
          onEachFeature={(feature, layer) => {
            const tract = feature.id ? featureLookup.get(String(feature.id)) : undefined;
            if (!tract) {
              return;
            }

            layer.bindTooltip(
              `<strong>${tract.tractName}</strong><br/>${tract.countyName}<br/>Prospex Suitability Score: ${formatScore(
                tract.prospexScore,
              )}`,
              { sticky: true, direction: "top" },
            );

            layer.on({
              mouseover: () => onHoverTract(tract),
              mouseout: () => onHoverTract(null),
              click: () => onSelectTract(tract),
            });
          }}
        />
      )}

      <MapCamera
        tracts={tracts}
        selectedCounty={selectedCounty}
        selectedTract={selectedTract}
      />
      <ScoreLegend />
    </MapContainer>
  );
}

type MapCameraProps = {
  tracts: TractRecord[];
  selectedCounty: CountyFilter;
  selectedTract: TractRecord | null;
};

function MapCamera({ tracts, selectedCounty, selectedTract }: MapCameraProps) {
  const map = useMap();

  useEffect(() => {
    if (selectedTract) {
      const bounds = L.geoJSON(selectedTract.feature).getBounds();
      if (bounds.isValid()) {
        map.fitBounds(bounds, { maxZoom: 14, padding: [36, 36] });
      }
      return;
    }

    const countyTracts =
      selectedCounty === "all"
        ? tracts
        : tracts.filter((tract) => tract.countyKey === selectedCounty);

    if (countyTracts.length > 0) {
      const bounds = L.geoJSON({
        type: "FeatureCollection",
        features: countyTracts.map((tract) => tract.feature),
      } as never).getBounds();
      if (bounds.isValid()) {
        map.fitBounds(bounds, { padding: [36, 36] });
      }
    }
  }, [map, selectedCounty, selectedTract, tracts]);

  return null;
}

export default MapView;
