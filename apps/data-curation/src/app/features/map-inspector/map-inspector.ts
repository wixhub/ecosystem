import {
  afterNextRender,
  Component,
  effect,
  ElementRef,
  inject,
  input,
  output,
  viewChild,
} from '@angular/core';

import { CurationMapService, TrackingPoint } from '@es/map-access';

@Component({
  selector: 'app-map-inspector',
  templateUrl: './map-inspector.html',
  styleUrl: './map-inspector.scss',
})
export class MapInspector {
  /**
   * Tracking points displayed on the map.
   */
  readonly data = input.required<TrackingPoint[]>();

  /**
   * Currently selected individual identifier.
   */
  readonly selectedId = input<string | null>(null);

  /**
   * Emits the ID of the selected individual when interacted with.
   */
  readonly select = output<string>();

  /**
   * Leaflet map container element reference from the template.
   */
  readonly mapContainer = viewChild.required<ElementRef<HTMLDivElement>>('mapContainer');

  /**
   * Injected curation map service handling Leaflet map lifecycle and layer rendering.
   */
  private readonly mapService = inject(CurationMapService);

  private isMapInitialized = false;

  constructor() {
    /**
     * Initializes Leaflet after the component has been rendered
     * and the map container is available in the DOM.
     */
    afterNextRender(() => {
      this.initializeMap();
    });

    /**
     * Re-renders tracking points whenever the input data changes.
     */
    effect(() => {
      const points = this.data();

      if (!this.isMapInitialized) {
        return;
      }

      this.mapService.renderTrackingPoints(points);
    });
  }

  /**
   * Creates the Leaflet map instance and renders initial tracking data.
   * The API key is handled internally by the map service via DI.
   */
  private initializeMap(): void {
    const container = this.mapContainer().nativeElement;
    const containerId = this.createContainerId();
    container.id = containerId;

    const points = this.data();
    const [latitude, longitude] = this.getInitialCenter(points);

    // Initialize map through the service without passing the API key manually
    this.mapService.initializeMap(containerId, [latitude, longitude], 10);

    this.isMapInitialized = true;

    if (points.length > 0) {
      this.mapService.renderTrackingPoints(points);
    }
  }

  /**
   * Generates a unique DOM ID for the Leaflet container element.
   */
  private createContainerId(): string {
    return `map-frame-${Math.random().toString(36).substring(2, 9)}`;
  }

  /**
   * Returns the initial map center based on the first valid tracking point.
   */
  private getInitialCenter(points: readonly TrackingPoint[]): [number, number] {
    const validPoint = points.find(
      (p) =>
        typeof p.latitude === 'number' &&
        typeof p.longitude === 'number' &&
        !isNaN(p.latitude) &&
        !isNaN(p.longitude),
    );

    if (!validPoint) {
      return [47.65, 9.47]; // Fallback coordinates
    }

    return [validPoint.latitude, validPoint.longitude];
  }
}
