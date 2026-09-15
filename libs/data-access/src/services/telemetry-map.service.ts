// Project bio-stream
import { Service } from '@angular/core';

import * as L from 'leaflet';

import { LeafletMapService } from './leaflet-map.service';

import { BioTelemetryRecord } from '../models/telemetry.model';

@Service()
export class TelemetryMapService extends LeafletMapService {
  /**
   * Renders telemetry records as markers and connects their locations
   * with a single vector path.
   */
  public renderTelemetryPoints(records: readonly BioTelemetryRecord[]): void {
    if (!this.mapInstance) {
      return;
    }

    this.clearLayers();

    const latLngs: [number, number][] = [];

    for (const record of records) {
      const latLng: [number, number] = [
        record.coordinates.lat,
        record.coordinates.lng,
      ];

      latLngs.push(latLng);

      const marker = L.circleMarker(latLng, {
        radius: 6,
        fillColor: this.getSpeciesColor(record.species),
        color: '#ffffff',
        weight: 1.5,
        opacity: 0.9,
        fillOpacity: 0.85,
      });

      marker.bindPopup(`
        <div style="font-family:sans-serif; font-size:12px;">
          <strong>Subject:</strong> ${record.subjectId}<br/>
          <strong>Species:</strong> ${record.species}<br/>
          <strong>HR:</strong> ${record.telemetry.heartRateBpm} BPM<br/>
          <strong>Time:</strong> ${new Date(record.timestamp).toLocaleTimeString()}
        </div>
      `);

      this.markerLayerGroup.addLayer(marker);
    }

    this.fitBounds(latLngs, 9);

    if (latLngs.length < 2) {
      return;
    }

    const polyline = L.polyline(latLngs, {
      color: '#3b82f6',
      weight: 2,
      dashArray: '4, 8',
      opacity: 0.6,
    });

    this.vectorLayerGroup.addLayer(polyline);
  }

  /**
   * Maps a species type to a marker color.
   */
  private getSpeciesColor(species: string): string {
    switch (species) {
      case 'AVIAN_MIGRATORY':
        return '#10b981';

      case 'MARINE_CETACEAN':
        return '#06b6d4';

      case 'TERRESTRIAL_UNGULATE':
        return '#f59e0b';

      default:
        return '#6366f1';
    }
  }
}
