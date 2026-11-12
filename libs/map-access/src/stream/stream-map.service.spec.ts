import { TestBed } from '@angular/core/testing';
import { StreamMapService } from './stream-map.service';
import { CARTO_CONFIG } from '@es/config/carto';
import { BioTelemetryRecord } from './stream.model';

describe('StreamMapService', () => {
  let service: StreamMapService;
  let container: HTMLDivElement;

  beforeEach(() => {
    // Create DOM element for Leaflet map container
    container = document.createElement('div');
    container.style.width = '400px';
    container.style.height = '300px';
    document.body.appendChild(container);

    TestBed.configureTestingModule({
      providers: [
        StreamMapService,
        { provide: CARTO_CONFIG, useValue: 'test-carto-key' },
      ],
    });

    service = TestBed.inject(StreamMapService);
    service.initializeMap(container, [47.5, 9.5], 6);
  });

  afterEach(() => {
    service.disposeMap();
    container.remove();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should render telemetry points and add them to layers', () => {
    const mockRecords: BioTelemetryRecord[] = [
      {
        id: 'rec-1',
        subjectId: 'wolf-01',
        species: 'TERRESTRIAL_UNGULATE',
        timestamp: new Date().toISOString(),
        latitude: 47.6,
        longitude: 9.6,
        telemetry: {
          heartRateBpm: 75,
          bodyTemperatureC: 38.5,
          activityLevelIndex: 0.8,
        },
      },
      {
        id: 'rec-2',
        subjectId: 'wolf-01',
        species: 'TERRESTRIAL_UNGULATE',
        timestamp: new Date().toISOString(),
        latitude: 47.7,
        longitude: 9.7,
        telemetry: {
          heartRateBpm: 80,
          bodyTemperatureC: 38.6,
          activityLevelIndex: 0.9,
        },
      },
    ];

    // Access protected layer groups cleanly without breaking eslint rules
    const mapService = service as unknown as {
      markerLayerGroup: L.LayerGroup;
      vectorLayerGroup: L.LayerGroup;
    };

    const addLayerSpy = vi.spyOn(mapService.markerLayerGroup, 'addLayer');
    const polylineAddSpy = vi.spyOn(mapService.vectorLayerGroup, 'addLayer');

    service.renderTelemetryPoints(mockRecords);

    // Expect markers for both points + polyline for route connection
    expect(addLayerSpy).toHaveBeenCalledTimes(2);
    expect(polylineAddSpy).toHaveBeenCalledTimes(1);
  });

  it('should clear layers before rendering new points', () => {
    const mapService = service as unknown as { clearLayers: () => void };
    const clearSpy = vi.spyOn(mapService, 'clearLayers');

    const mockRecords: BioTelemetryRecord[] = [
      {
        id: 'rec-1',
        subjectId: 'bird-01',
        species: 'AVIAN_MIGRATORY',
        timestamp: new Date().toISOString(),
        latitude: 48.0,
        longitude: 10.0,
        telemetry: {
          heartRateBpm: 120,
          bodyTemperatureC: 40.1,
          activityLevelIndex: 1.2,
        },
      },
    ];

    service.renderTelemetryPoints(mockRecords);

    expect(clearSpy).toHaveBeenCalled();
  });
});
