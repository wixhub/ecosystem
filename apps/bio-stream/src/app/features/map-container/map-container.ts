import { AfterViewInit, Component, effect, inject, signal } from '@angular/core';

import {
  BioTelemetryRecord,
  TelemetryFilterModel,
  TelemetryMapService,
  TelemetryStreamService,
} from '@es/data-access';
import { TelemetryAnalytics } from '../telemetry-analytics/telemetry-analytics';
import { TelemetryFilters } from '../telemetry-filters/telemetry-filters';

@Component({
  selector: 'app-map-container',
  imports: [TelemetryAnalytics, TelemetryFilters],
  templateUrl: './map-container.html',
  styleUrl: './map-container.scss',
})
export class MapContainer implements AfterViewInit {
  private readonly mapService = inject(TelemetryMapService);

  protected readonly telemetryService = inject(TelemetryStreamService);

  /**
   * Default study ID used when the component is initialized
   * and when an invalid custom study ID is provided.
   */
  public readonly selectedStudyId = signal('2911040');

  /**
   * Controls the error notification displayed by the component.
   */
  public readonly errorMessage = signal<string | null>(null);

  /**
   * Stores the currently active telemetry filters.
   */
  public readonly filters = signal<TelemetryFilterModel>({
    species: 'ALL',
    minHeartRate: 20,
    maxHeartRate: 220,
    liveStreamEnabled: true,
  });

  /**
   * Contains telemetry records after applying the active filters.
   */
  public readonly filteredRecords = signal<BioTelemetryRecord[]>([]);

  private errorTimeoutId: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    /**
     * Watches the live stream for errors.
     *
     * If a custom study fails, the component falls back to the
     * default Galapagos Albatrosses study.
     */
    effect(() => {
      const liveError = this.telemetryService.liveError();
      const currentStudyId = this.selectedStudyId();

      if (!liveError) {
        return;
      }

      if (currentStudyId === '2911040') {
        this.showAutoClosingError(
          `Study ID "${currentStudyId}" returned no data or failed. Please check your internet connection or try again later.`,
        );

        return;
      }

      this.selectedStudyId.set('2911040');
      this.switchToLiveDataset('2911040');

      this.showAutoClosingError(
        `Study ID "${currentStudyId}" returned no data or failed. Reverting back to default Galapagos Albatrosses (2911040). Verify the ID or check API limits.`,
      );
    });

    /**
     * Applies the active filters to the telemetry stream.
     */
    effect(() => {
      const records = this.telemetryService.telemetryRecords();
      const currentFilters = this.filters();

      if (!currentFilters.liveStreamEnabled) {
        this.filteredRecords.set([]);
        return;
      }

      const filtered = records.filter((record) => {
        const matchesSpecies =
          currentFilters.species === 'ALL' || record.species === currentFilters.species;

        const heartRate = record.telemetry.heartRateBpm;

        const matchesHeartRate =
          heartRate >= currentFilters.minHeartRate && heartRate <= currentFilters.maxHeartRate;

        return matchesSpecies && matchesHeartRate;
      });

      this.filteredRecords.set(filtered);
    });

    /**
     * Updates the Leaflet map whenever the filtered telemetry data changes.
     */
    effect(() => {
      const records = this.filteredRecords();

      this.mapService.renderTelemetryPoints(records);
    });
  }

  /**
   * Initializes the map after the component view has been created.
   */
  public ngAfterViewInit(): void {
    this.mapService.initializeMap('leaflet-spatial-canvas', [15.0, 10.0], 3);

    // Start with the default active albatrosses study.
    this.telemetryService.setStudyId('2911040');
  }

  /**
   * Displays an error message and automatically hides it after 12 seconds.
   */
  private showAutoClosingError(message: string): void {
    this.clearErrorTimeout();

    this.errorMessage.set(message);

    this.errorTimeoutId = setTimeout(() => {
      this.errorMessage.set(null);
      this.errorTimeoutId = null;
    }, 12_000);
  }

  /**
   * Clears the currently displayed error message.
   */
  public dismissError(): void {
    this.clearErrorTimeout();
    this.errorMessage.set(null);
  }

  /**
   * Clears the active error timeout.
   */
  private clearErrorTimeout(): void {
    if (this.errorTimeoutId === null) {
      return;
    }

    clearTimeout(this.errorTimeoutId);
    this.errorTimeoutId = null;
  }

  /**
   * Updates the selected study ID from the input field.
   */
  public onStudyChange(event: Event): void {
    const input = event.target as HTMLInputElement;

    this.selectedStudyId.set(input.value);
  }

  /**
   * Replaces the currently active telemetry filters.
   */
  public onFilterUpdated(newFilters: TelemetryFilterModel): void {
    this.filters.set(newFilters);
  }

  /**
   * Switches the telemetry stream to the specified study.
   */
  public switchToLiveDataset(studyId: string): void {
    this.dismissError();
    this.telemetryService.setStudyId(studyId);
  }
}
