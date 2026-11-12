import { DestroyRef, inject } from '@angular/core';
import { Service } from '@angular/core';
import { CARTO_CONFIG } from '@es/config/carto';
import * as L from 'leaflet';

/**
 * Abstract base service providing shared Leaflet map initialization,
 * layer groups management, and resource cleanup lifecycle.
 */
@Service()
export abstract class LeafletMapService {
  protected mapInstance: L.Map | null = null;

  protected readonly markerLayerGroup = L.layerGroup();
  protected readonly vectorLayerGroup = L.layerGroup();

  private readonly destroyRef = inject(DestroyRef);
  private readonly cartoApiKey = inject(CARTO_CONFIG, { optional: true }) ?? '';

  constructor() {
    this.destroyRef.onDestroy(() => {
      this.disposeMap();
    });
  }

  /**
   * Initializes the Leaflet map container and adds the shared CARTO tile layer.
   */
  public initializeMap(
    containerId: string | HTMLElement,
    initialCenter: [number, number] = [47.5, 9.5],
    zoom = 6,
    theme: 'voyager' | 'dark_all' = 'voyager',
  ): L.Map {
    if (this.mapInstance) {
      return this.mapInstance;
    }

    this.mapInstance = L.map(containerId, {
      zoomControl: false,
      attributionControl: true,
    }).setView(initialCenter, zoom);

    L.tileLayer(
      `https://{s}.basemaps.cartocdn.com/rastertiles/${theme}/{z}/{x}/{y}{r}.png?key=${this.cartoApiKey}`,
      {
        attribution: '&copy; CARTO',
        maxZoom: 19,
        subdomains: 'abcd',
      },
    ).addTo(this.mapInstance);

    this.markerLayerGroup.addTo(this.mapInstance);
    this.vectorLayerGroup.addTo(this.mapInstance);

    this.invalidateMapSize();

    return this.mapInstance;
  }

  /**
   * Forces Leaflet to recalculate container dimensions.
   */
  protected invalidateMapSize(): void {
    setTimeout(() => {
      this.mapInstance?.invalidateSize();
    }, 150);
  }

  /**
   * Fits the map viewport around provided coordinates.
   */
  protected fitBounds(latLngs: L.LatLngExpression[], maxZoom = 12): void {
    if (!this.mapInstance || latLngs.length === 0) {
      return;
    }

    const bounds = L.latLngBounds(latLngs);
    this.mapInstance.fitBounds(bounds, {
      padding: [50, 50],
      maxZoom,
    });
  }

  /**
   * Clears all layers from marker and vector groups.
   */
  protected clearLayers(): void {
    this.markerLayerGroup.clearLayers();
    this.vectorLayerGroup.clearLayers();
  }

  /**
   * Destroys the Leaflet map instance and releases memory.
   */
  public disposeMap(): void {
    if (!this.mapInstance) {
      return;
    }

    this.mapInstance.remove();
    this.mapInstance = null;
  }
}
