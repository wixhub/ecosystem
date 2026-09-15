import { DestroyRef, inject } from '@angular/core';

import * as L from 'leaflet';

import { CARTO_API_KEY } from '@es/config';

export abstract class LeafletMapService {
  protected mapInstance: L.Map | null = null;

  protected readonly markerLayerGroup = L.layerGroup();
  protected readonly vectorLayerGroup = L.layerGroup();

  private readonly destroyRef = inject(DestroyRef);

  constructor() {
    this.destroyRef.onDestroy(() => {
      this.disposeMap();
    });
  }

  /**
   * Initializes the Leaflet map and adds the shared CARTO tile layer.
   */
  public initializeMap(
    containerId: string,
    initialCenter: [number, number] = [20, 0],
    zoom = 3,
  ): void {
    if (this.mapInstance) {
      return;
    }

    this.mapInstance = L.map(containerId, {
      zoomControl: false,
      attributionControl: true,
    }).setView(initialCenter, zoom);

    L.tileLayer(
      `https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png?key=${CARTO_API_KEY}`,
      {
        attribution: '&copy; CARTO',
        maxZoom: 19,
        subdomains: 'abcd',
      },
    ).addTo(this.mapInstance);

    this.markerLayerGroup.addTo(this.mapInstance);
    this.vectorLayerGroup.addTo(this.mapInstance);

    this.invalidateMapSize();
  }

  /**
   * Forces Leaflet to recalculate the map container dimensions.
   */
  protected invalidateMapSize(): void {
    setTimeout(() => {
      this.mapInstance?.invalidateSize();
    }, 150);
  }

  /**
   * Fits the map viewport around the provided coordinates.
   */
  protected fitBounds(
    latLngs: readonly L.LatLngExpression[],
    maxZoom: number,
  ): void {
    if (!this.mapInstance || latLngs.length === 0) {
      return;
    }

    const bounds = L.latLngBounds(latLngs);

    this.mapInstance.fitBounds(bounds, {
      padding: [60, 60],
      maxZoom,
    });
  }

  /**
   * Removes all currently rendered markers and vector layers.
   */
  protected clearLayers(): void {
    this.markerLayerGroup.clearLayers();
    this.vectorLayerGroup.clearLayers();
  }

  /**
   * Destroys the Leaflet map and releases all associated resources.
   */
  public disposeMap(): void {
    if (!this.mapInstance) {
      return;
    }

    this.mapInstance.remove();
    this.mapInstance = null;
  }
}
