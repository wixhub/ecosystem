// stream model

import { BaseGeoPoint } from '../geo-base.model';

export type SpeciesType =
  | 'AVIAN_MIGRATORY'
  | 'MARINE_CETACEAN'
  | 'TERRESTRIAL_UNGULATE';

export interface BioTelemetryRecord extends BaseGeoPoint {
  readonly id: string;
  readonly subjectId: string;
  readonly species: SpeciesType;
  readonly timestamp: string; // ISO 8601
  readonly latitude: number;
  readonly longitude: number;
  readonly telemetry: {
    readonly heartRateBpm: number;
    readonly bodyTemperatureC: number;
    readonly activityLevelIndex: number;
  };
}
