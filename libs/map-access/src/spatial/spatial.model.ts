// spatial model

import { BaseGeoPoint } from '../geo-base.model';

export interface MigrationTelemetryPoint extends BaseGeoPoint {
  readonly id: string;
  readonly individualId: string;
  readonly timestamp: number; // Unix epoch ms
  readonly altitude?: number;
  readonly groundSpeed?: number;
  readonly sensorType: 'GPS' | 'Argos Doppler';
}

export interface AnimalTrack {
  readonly individualId: string;
  readonly speciesName: string;
  readonly commonName: string;
  readonly tagDeployDate: string;
  readonly color: string;
  readonly points: MigrationTelemetryPoint[];
}

export type PlaybackSpeed = 1 | 5 | 10 | 50 | 100;

export interface MigrationDataset {
  readonly datasetId: string;
  readonly title: string;
  readonly description: string;
  readonly startTime: number;
  readonly endTime: number;
  readonly tracks: AnimalTrack[];
}
