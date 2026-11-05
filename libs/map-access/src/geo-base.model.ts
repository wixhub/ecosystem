export type LatLngTuple = [number, number];

export interface BaseGeoPoint {
  readonly latitude: number;
  readonly longitude: number;
  readonly timestamp: number | string;
}
