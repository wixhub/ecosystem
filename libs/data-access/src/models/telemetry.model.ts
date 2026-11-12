// Project bio-stream
export type LatLngTuple = [number, number];

export interface BaseGeoPoint {
  readonly latitude: number;
  readonly longitude: number;
  readonly timestamp: number | string;
}

export type SpeciesType =
  | 'AVIAN_MIGRATORY'
  | 'MARINE_CETACEAN'
  | 'TERRESTRIAL_UNGULATE';

/**
 * Unified telemetry record adhering to the BaseGeoPoint standard
 * with root-level latitude and longitude.
 */
export interface BioTelemetryRecord extends BaseGeoPoint {
  readonly id: string;
  readonly subjectId: string;
  readonly species: SpeciesType;
  readonly timestamp: string; // ISO 8601
  readonly telemetry: {
    readonly heartRateBpm: number;
    readonly bodyTemperatureC: number;
    readonly activityLevelIndex: number;
  };
}

/**
 * Interface representing a simple geographic point
 * (used for boundary constraints or secondary geometry).
 */
export interface GeoPointConstraint {
  readonly latitude: number;
  readonly longitude: number;
  readonly elevationMeters?: number;
}

export interface TelemetryFilterModel {
  readonly species: SpeciesType | 'ALL';
  readonly minHeartRate: number;
  readonly maxHeartRate: number;
  readonly liveStreamEnabled: boolean;
  readonly polygonBoundaryConstraint?: readonly GeoPointConstraint[];
}
