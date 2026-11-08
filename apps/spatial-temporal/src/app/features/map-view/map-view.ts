import { Component, afterNextRender, effect, ElementRef, inject, viewChild } from '@angular/core';
import { MigrationService } from '@es/data-access';
import { SpatialMapService } from '@es/map-access';

@Component({
  selector: 'app-map-view',
  templateUrl: './map-view.html',
  styleUrl: './map-view.scss',
})
export class MapView {
  private readonly migrationService = inject(MigrationService);
  private readonly mapService = inject(SpatialMapService);

  /**
   * Leaflet map container element reference from the template.
   */
  protected readonly mapContainer = viewChild.required<ElementRef<HTMLElement>>('mapContainer');

  private isMapInitialized = false;

  constructor() {
    /**
     * Initializes Leaflet map via SpatialMapService after the component
     * has been rendered and the DOM container is available.
     */
    afterNextRender(() => {
      this.initializeMap();
    });

    /**
     * Reacts to live temporal playback positions via signals (zoneless safe).
     */
    effect(() => {
      const positions = this.migrationService.currentPositions();
      if (this.isMapInitialized) {
        this.mapService.updateMapEntities(positions);
      }
    });

    /**
     * Reacts to active/filtered individual track selection toggles in the sidebar.
     */
    effect(() => {
      const activeTracks = this.migrationService.activeTracks();
      if (this.isMapInitialized) {
        this.mapService.rebuildStaticTracks(activeTracks);
      }
    });

    /**
     * Automatically fits map bounds when a new dataset is successfully loaded.
     */
    effect(() => {
      const dataset = this.migrationService.dataset();
      if (
        this.isMapInitialized &&
        dataset &&
        dataset.tracks.length > 0 &&
        dataset.datasetId !== 'loading'
      ) {
        this.mapService.fitMapToTracks(dataset.tracks);
      }
    });
  }

  /**
   * Initializes the map instance via SpatialMapService and performs initial rendering pass.
   */
  private initializeMap(): void {
    const container = this.mapContainer().nativeElement;
    const containerId = this.createContainerId();
    container.id = containerId;

    // Initialize map centered over Central Europe (API key is handled internally by the service)
    this.mapService.initializeMap(containerId, [47.5, 9.5], 6);
    this.isMapInitialized = true;

    // Initial render pass
    this.mapService.rebuildStaticTracks(this.migrationService.activeTracks());
    this.mapService.updateMapEntities(this.migrationService.currentPositions());

    const dataset = this.migrationService.dataset();
    if (dataset && dataset.tracks.length > 0) {
      this.mapService.fitMapToTracks(dataset.tracks);
    }
  }

  /**
   * Generates a unique DOM ID for the map container element.
   */
  private createContainerId(): string {
    return `map-frame-${Math.random().toString(36).substring(2, 9)}`;
  }
}
