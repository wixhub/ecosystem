// Project data-curation
import { Service } from '@angular/core';

import * as L from 'leaflet';

import { LeafletMapService } from './leaflet-map.service';

import { TrackingPoint } from '../models/tracking.model';

@Service()
export class TrackingMapService extends LeafletMapService {
  /**
   * Renders tracking points and creates an independent track
   * for every individual.
   */
  public renderTrackingPoints(records: readonly TrackingPoint[]): void {
    if (!this.mapInstance) {
      return;
    }

    this.clearLayers();

    const allLatLngs: [number, number][] = [];

    const individualTracks = new Map<
      string,
      {
        latLngs: [number, number][];
        color: string;
      }
    >();

    for (const record of records) {
      const latLng: [number, number] = [record.latitude, record.longitude];

      allLatLngs.push(latLng);

      let trackData = individualTracks.get(record.individualId);

      if (!trackData) {
        trackData = {
          latLngs: [],
          color: this.getIndividualColor(record.individualId),
        };

        individualTracks.set(record.individualId, trackData);
      }

      trackData.latLngs.push(latLng);

      const markerColor = record.isFlagged ? '#ef4444' : trackData.color;

      const marker = L.circleMarker(latLng, {
        radius: 6,
        fillColor: markerColor,
        color: '#ffffff',
        weight: 1.5,
        opacity: 0.9,
        fillOpacity: 0.85,
      });

      marker.bindPopup(`
        <div style="font-family:sans-serif; font-size:12px;">
          <strong>Subject:</strong> ${record.individualId}<br/>
          <strong>Speed:</strong> ${record.speedKmH ?? 0} km/h<br/>
          <strong>Accuracy:</strong> ${record.accuracyMeters}m<br/>
          <strong>Time:</strong> ${new Date(record.timestamp).toLocaleTimeString()}
        </div>
      `);

      this.markerLayerGroup.addLayer(marker);
    }

    this.renderIndividualTracks(individualTracks);

    this.fitBounds(allLatLngs, 14);
  }

  /**
   * Renders one polyline for every tracked individual.
   */
  private renderIndividualTracks(
    individualTracks: ReadonlyMap<
      string,
      {
        latLngs: [number, number][];
        color: string;
      }
    >,
  ): void {
    for (const { latLngs, color } of individualTracks.values()) {
      if (latLngs.length < 2) {
        continue;
      }

      const polyline = L.polyline(latLngs, {
        color,
        weight: 2.5,
        dashArray: '4, 8',
        opacity: 0.8,
      });

      this.vectorLayerGroup.addLayer(polyline);
    }
  }

  /**
   * Generates a deterministic color for an individual identifier.
   */
  private getIndividualColor(id: string): string {
    const palette = [
      '#3b82f6',
      '#10b981',
      '#f59e0b',
      '#8b5cf6',
      '#ec4899',
      '#06b6d4',
    ];

    let hash = 0;

    for (let index = 0; index < id.length; index++) {
      hash = id.charCodeAt(index) + ((hash << 5) - hash);
    }

    return palette[Math.abs(hash) % palette.length];
  }
}
