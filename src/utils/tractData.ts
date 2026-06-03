export type CountyFilter = "all" | "miami-dade" | "broward" | "palm-beach";

export type GeoJsonGeometry = {
  type: string;
  coordinates: unknown;
};

export type TractFeature = {
  type: "Feature";
  geometry: GeoJsonGeometry | null;
  properties: Record<string, unknown> | null;
  id?: string | number;
};

export type FeatureCollection = {
  type: "FeatureCollection";
  features: TractFeature[];
};

export type ShapExplanation = {
  positive: string[];
  negative: string[];
  unavailable: boolean;
};

export type TractRecord = {
  id: string;
  feature: TractFeature;
  properties: Record<string, unknown>;
  geoid: string;
  countyName: string;
  countyKey: CountyFilter;
  tractName: string;
  prospexScore: number | null;
  gisScore: number | null;
  recentConstructionRate: number | null;
  shap: ShapExplanation;
};

const DATA_URL = "/data/prospex_cre_v1_tract_scores.geojson";

const COUNTY_ALIASES: Record<Exclude<CountyFilter, "all">, string[]> = {
  "miami-dade": ["miami dade", "miami-dade"],
  broward: ["broward"],
  "palm-beach": ["palm beach"],
};

const SCORE_FIELDS = [
  "prospex_score_100",
  "prospexScore100",
  "prospex_score",
  "score_100",
  "suitability_score",
];

const GIS_SCORE_FIELDS = [
  "gis_suitability_score_100",
  "gisSuitabilityScore100",
  "baseline_score_100",
  "gis_score",
];

const RECENT_CONSTRUCTION_FIELDS = [
  "recent_construction_rate",
  "recentConstructionRate",
  "construction_rate",
];

const COUNTY_FIELDS = ["county_name", "county", "COUNTY", "countyName"];
const TRACT_NAME_FIELDS = ["NAMELSAD", "tract_name", "tract", "name", "NAME"];
const GEOID_FIELDS = ["GEOID", "geoid", "tract_geoid"];

// SHAP parsing is intentionally centralized here. Update these candidate field
// names if the model export changes its explanation schema.
const POSITIVE_DRIVER_FIELDS = [
  "top_positive_driver_1",
  "top_positive_driver_2",
  "top_positive_driver_3",
  "positive_driver_1",
  "positive_driver_2",
  "positive_driver_3",
  "top_shap_positive_1",
  "top_shap_positive_2",
  "top_shap_positive_3",
  "shap_positive_1",
  "shap_positive_2",
  "shap_positive_3",
];

// SHAP parsing is intentionally centralized here. Update these candidate field
// names if the model export changes its explanation schema.
const NEGATIVE_DRIVER_FIELDS = [
  "top_negative_driver_1",
  "top_negative_driver_2",
  "top_negative_driver_3",
  "negative_driver_1",
  "negative_driver_2",
  "negative_driver_3",
  "top_shap_negative_1",
  "top_shap_negative_2",
  "top_shap_negative_3",
  "shap_negative_1",
  "shap_negative_2",
  "shap_negative_3",
];

export async function loadTractData(): Promise<TractRecord[]> {
  const response = await fetch(DATA_URL);

  const missingFileMessage = `Could not load ${DATA_URL}. Add prospex_cre_v1_tract_scores.geojson to public/data.`;

  if (!response.ok) {
    throw new Error(missingFileMessage);
  }

  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("json")) {
    throw new Error(missingFileMessage);
  }

  let geojson: Partial<FeatureCollection>;
  try {
    geojson = (await response.json()) as Partial<FeatureCollection>;
  } catch {
    throw new Error(
      `Could not parse ${DATA_URL}. Confirm the file is valid GeoJSON.`,
    );
  }

  const features = Array.isArray(geojson.features) ? geojson.features : [];

  return features
    .filter((feature): feature is TractFeature => feature?.type === "Feature")
    .map(normalizeFeature);
}

export function getTopTracts(
  tracts: TractRecord[],
  county: CountyFilter,
  limit = 10,
): TractRecord[] {
  return tracts
    .filter((tract) => county === "all" || tract.countyKey === county)
    .filter((tract) => tract.prospexScore !== null)
    .sort((a, b) => (b.prospexScore ?? -Infinity) - (a.prospexScore ?? -Infinity))
    .slice(0, limit);
}

export function formatScore(score: number | null): string {
  return score === null ? "Unavailable" : `${Math.round(score)}`;
}

export function formatMetric(value: number | null): string {
  if (value === null) {
    return "Unavailable";
  }

  if (Math.abs(value) <= 1) {
    return `${(value * 100).toFixed(1)}%`;
  }

  return value.toLocaleString(undefined, {
    maximumFractionDigits: 1,
  });
}

export function countyLabel(county: CountyFilter): string {
  switch (county) {
    case "miami-dade":
      return "Miami Dade";
    case "broward":
      return "Broward";
    case "palm-beach":
      return "Palm Beach";
    default:
      return "All Counties";
  }
}

function normalizeFeature(feature: TractFeature, index: number): TractRecord {
  const properties = feature.properties ?? {};
  const geoid = readString(properties, GEOID_FIELDS) ?? `tract-${index + 1}`;
  const id = `${geoid}-${index}`;
  const countyName = cleanCountyName(readString(properties, COUNTY_FIELDS));
  const tractName = readString(properties, TRACT_NAME_FIELDS) ?? geoid;
  const prospexScore = readNumber(properties, SCORE_FIELDS);
  const gisScore = readNumber(properties, GIS_SCORE_FIELDS);
  const recentConstructionRate = readNumber(properties, RECENT_CONSTRUCTION_FIELDS);
  const shap = extractShapExplanation(properties);
  const normalizedFeature = {
    ...feature,
    id,
    properties,
  };

  return {
    id,
    feature: normalizedFeature,
    properties,
    geoid,
    countyName,
    countyKey: normalizeCountyKey(countyName),
    tractName,
    prospexScore,
    gisScore,
    recentConstructionRate,
    shap,
  };
}

function extractShapExplanation(
  properties: Record<string, unknown>,
): ShapExplanation {
  const positive = readDriverFields(properties, POSITIVE_DRIVER_FIELDS);
  const negative = readDriverFields(properties, NEGATIVE_DRIVER_FIELDS);

  return {
    positive,
    negative,
    unavailable: positive.length === 0 && negative.length === 0,
  };
}

function readDriverFields(
  properties: Record<string, unknown>,
  fields: string[],
): string[] {
  return fields
    .map((field) => readString(properties, [field]))
    .filter((value): value is string => Boolean(value));
}

function readString(
  properties: Record<string, unknown>,
  fields: string[],
): string | null {
  for (const field of fields) {
    const value = properties[field];
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
    if (typeof value === "number" && Number.isFinite(value)) {
      return String(value);
    }
  }

  return null;
}

function readNumber(
  properties: Record<string, unknown>,
  fields: string[],
): number | null {
  for (const field of fields) {
    const value = properties[field];
    if (typeof value === "number" && Number.isFinite(value)) {
      return value;
    }
    if (typeof value === "string" && value.trim()) {
      const parsed = Number(value.replace(/,/g, ""));
      if (Number.isFinite(parsed)) {
        return parsed;
      }
    }
  }

  return null;
}

function cleanCountyName(countyName: string | null): string {
  if (!countyName) {
    return "Unknown County";
  }

  return countyName.replace(/\s+county$/i, "").replace(/-/g, " ").trim();
}

function normalizeCountyKey(countyName: string): CountyFilter {
  const normalized = countyName.toLowerCase().replace(/-/g, " ");

  for (const [county, aliases] of Object.entries(COUNTY_ALIASES)) {
    if (aliases.some((alias) => normalized.includes(alias))) {
      return county as CountyFilter;
    }
  }

  return "all";
}
