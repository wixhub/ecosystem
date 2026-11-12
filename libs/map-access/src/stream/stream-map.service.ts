import { Service } from '@angular/core';
import * as L from 'leaflet';
import { LeafletMapService } from '../leaflet-map.service';
import { BioTelemetryRecord, SpeciesType } from './stream.model';

/**
 * Service dedicated to rendering bio-telemetry records and health indicators on the map.
 */
@Service()
export class StreamMapService extends LeafletMapService {
  /**
   * Renders telemetry records as markers and connects their locations
   * with a single vector path polyline.
   */
  public renderTelemetryPoints(records: readonly BioTelemetryRecord[]): void {
    if (!this.mapInstance) {
      return;
    }

    this.clearLayers();

    const latLngs: [number, number][] = [];

    for (const record of records) {
      // Защита от undefined, null или NaN в координатах
      if (
        typeof record.latitude !== 'number' ||
        typeof record.longitude !== 'number' ||
        isNaN(record.latitude) ||
        isNaN(record.longitude)
      ) {
        continue;
      }

      const latLng: [number, number] = [record.latitude, record.longitude];

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
          <strong>Temp:</strong> ${record.telemetry.bodyTemperatureC} °C<br/>
          <strong>Time:</strong> ${new Date(record.timestamp).toLocaleTimeString()}
        </div>
      `);

      this.markerLayerGroup.addLayer(marker);
    }

    // Вызываем fitBounds только если у нас есть валидные точки
    if (latLngs.length > 0) {
      this.fitBounds(latLngs, 12);
    }

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
   * Maps a species type to a corresponding marker color.
   */
  private getSpeciesColor(species: SpeciesType): string {
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
