import { Service } from '@angular/core';
import * as L from 'leaflet';
import { LeafletMapService } from '../leaflet-map.service';
import { AnimalTrack, MigrationTelemetryPoint } from './spatial.model';

/**
 * Service dedicated to rendering spatial-temporal animal migration tracks,
 * historical trails and current playback positions on the map.
 */
@Service()
export class SpatialMapService extends LeafletMapService {
  private readonly trackLayers = new Map<string, L.Polyline>();
  private readonly markerLayers = new Map<string, L.CircleMarker>();
  private readonly trailLayers = new Map<string, L.Polyline>();

  /**
   * Rebuilds background static full-track vector lines for active animal tracks.
   */
  public rebuildStaticTracks(tracks: readonly AnimalTrack[]): void {
    if (!this.mapInstance) {
      return;
    }

    // Purge outdated track vector overlays
    this.trackLayers.forEach((layer) => layer.remove());
    this.trackLayers.clear();

    const activeIds = new Set(tracks.map((t) => t.individualId));

    // Clear stale markers & trails for deselected individuals
    this.markerLayers.forEach((marker, id) => {
      if (!activeIds.has(id)) {
        marker.remove();
        this.markerLayers.delete(id);
      }
    });
    this.trailLayers.forEach((trail, id) => {
      if (!activeIds.has(id)) {
        trail.remove();
        this.trailLayers.delete(id);
      }
    });

    // Render full background reference vector paths
    for (const track of tracks) {
      const latLngs = track.points.map(
        (p) => [p.latitude, p.longitude] as [number, number],
      );
      const polyline = L.polyline(latLngs, {
        color: track.color,
        weight: 1.5,
        opacity: 0.25,
        dashArray: '4, 4',
      }).addTo(this.mapInstance);

      this.trackLayers.set(track.individualId, polyline);
    }
  }

  /**
   * Updates current temporal playback positions and short trailing paths.
   */
  public updateMapEntities(
    positions: readonly {
      track: AnimalTrack;
      currentPoint: MigrationTelemetryPoint;
      trail: readonly MigrationTelemetryPoint[];
    }[],
  ): void {
    if (!this.mapInstance) {
      return;
    }

    for (const pos of positions) {
      const { track, currentPoint, trail } = pos;
      const latLng: [number, number] = [
        currentPoint.latitude,
        currentPoint.longitude,
      ];

      const trailLatLngs = trail.map(
        (p) => [p.latitude, p.longitude] as [number, number],
      );

      if (this.trailLayers.has(track.individualId)) {
        this.trailLayers.get(track.individualId)?.setLatLngs(trailLatLngs);
      } else {
        const trailLine = L.polyline(trailLatLngs, {
          color: track.color,
          weight: 3,
          opacity: 0.8,
        }).addTo(this.mapInstance);
        this.trailLayers.set(track.individualId, trailLine);
      }

      const popupContent = `
        <div class="map-popup" style="font-family:sans-serif; font-size:12px;">
          <strong>${track.commonName}</strong><br/>
          <small>Species: <em>${track.speciesName}</em></small><hr/>
          <b>ID:</b> ${track.individualId}<br/>
          <b>Time:</b> ${new Date(currentPoint.timestamp).toUTCString()}<br/>
          <b>Sensor:</b> ${currentPoint.sensorType}
          ${currentPoint.groundSpeed !== undefined ? `<br/><b>Speed:</b> ${currentPoint.groundSpeed} m/s` : ''}
          ${currentPoint.altitude !== undefined ? `<br/><b>Altitude:</b> ${currentPoint.altitude} m` : ''}
        </div>
      `;

      const existingMarker = this.markerLayers.get(track.individualId);

      if (existingMarker) {
        existingMarker.setLatLng(latLng);
        existingMarker.bindPopup(popupContent);
      } else {
        const marker = L.circleMarker(latLng, {
          radius: 7,
          fillColor: track.color,
          color: '#ffffff',
          weight: 2,
          opacity: 1,
          fillOpacity: 0.9,
        }).addTo(this.mapInstance);

        marker.bindPopup(popupContent);
        this.markerLayers.set(track.individualId, marker);
      }
    }
  }

  /**
   * Fits map bounds to encompass all points within the provided tracks.
   */
  public fitMapToTracks(tracks: readonly AnimalTrack[]): void {
    if (!this.mapInstance) {
      return;
    }

    const allLatLngs: [number, number][] = [];

    for (const track of tracks) {
      for (const p of track.points) {
        allLatLngs.push([p.latitude, p.longitude]);
      }
    }

    if (allLatLngs.length > 0) {
      this.fitBounds(allLatLngs, 12);
    }
  }
}
