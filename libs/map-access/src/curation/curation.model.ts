// curation model

import { BaseGeoPoint } from '../geo-base.model';

export interface TrackingPoint extends BaseGeoPoint {
  readonly id: string;
  readonly individualId: string;
  readonly timestamp: string;
  readonly speedKmH?: number;
  readonly accuracyMeters: number;
  readonly isFlagged: boolean;
  readonly flagReason?: string;
  readonly manuallyOverridden?: boolean;
}

export interface ManualOverride {
  readonly isFlagged: boolean;
  readonly manuallyOverridden: boolean;
}
