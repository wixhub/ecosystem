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

import { TrackingMapService, TrackingPoint } from '@es/data-access';

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
   * Currently selected individual.
   */
  readonly selectedId = input<string | null>(null);

  /**
   * Emits the ID of the selected individual.
   */
  readonly select = output<string>();

  /**
   * Leaflet map container element.
   */
  readonly mapContainer = viewChild.required<ElementRef<HTMLDivElement>>('mapContainer');

  private readonly mapService = inject(TrackingMapService);

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
   * Creates the Leaflet map and renders the initial tracking data.
   */
  private initializeMap(): void {
    const container = this.mapContainer().nativeElement;

    const containerId = this.createContainerId();

    container.id = containerId;

    const points = this.data();

    const [latitude, longitude] = this.getInitialCenter(points);

    this.mapService.initializeMap(containerId, [latitude, longitude], 10);

    this.isMapInitialized = true;

    if (points.length > 0) {
      this.mapService.renderTrackingPoints(points);
    }
  }

  /**
   * Creates a unique DOM ID for the Leaflet container.
   */
  private createContainerId(): string {
    return `map-frame-${Math.random().toString(36).substring(2, 9)}`;
  }

  /**
   * Returns the initial map center based on the first tracking point.
   */
  private getInitialCenter(points: readonly TrackingPoint[]): [number, number] {
    if (points.length === 0) {
      return [47.65, 9.47];
    }

    return [points[0].latitude, points[0].longitude];
  }
}
