export interface Project {
  azonosito: string;
  szervezet_neve: string;
  adoszama: string;
  besorolas: string;
  szekhely_varos: string;
  szekhely_orszag: string;
  szervezet_tipusa: string;
  osszeg: number;
  tamogatas: number;
  palyazati_dontes: string;
  palyazat_targya: string;
  megye?: string;
  regio?: string;
}

export interface FilterState {
  searchQuery: string;
  dontes: string[];
  varos: string[];
  besorolas: string[];
  szervezet_tipusa: string[];
  minOsszeg: number;
  maxOsszeg: number;
  groupBy?: 'none' | 'szervezet' | 'varos' | 'besorolas' | 'szervezet_tipusa' | 'dontes';
  activeValueType: 'requested' | 'awarded';
}

export interface GroupedProject {
  id: string; // unique key for the group
  name: string;
  adoszama?: string;
  count: number;
  osszeg: number;
  tamogatas: number;
}

export interface AggregatedData {
  osszesOsszeg: number;
  projektekSzama: number;
  atlagOsszeg: number;
  varosokSzerint: Record<string, { count: number; osszeg: number }>;
  besorolasSzerint: Record<string, { count: number; osszeg: number }>;
  dontesSzerint: Record<string, { count: number; osszeg: number }>;
  szervezetTipusSzerint: Record<string, { count: number; osszeg: number }>;
}

export interface GeoJsonFeature {
  type: 'Feature';
  properties: {
    regio: string;
    megye: string;
    kisterseg: string;
    varos: string;
    varos_nev_join: string;
  };
  geometry: {
    type: 'MultiPolygon';
    coordinates: number[][][][];
  };
}

export interface GeoJsonData {
  type: 'FeatureCollection';
  features: GeoJsonFeature[];
}
