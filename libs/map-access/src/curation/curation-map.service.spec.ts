import { TestBed } from '@angular/core/testing';
import { CurationMapService } from './curation-map.service';
import { CARTO_CONFIG } from '@es/config/carto';
import { TrackingPoint } from './curation.model';
import * as L from 'leaflet';

describe('CurationMapService', () => {
  let service: CurationMapService;
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement('div');
    container.style.width = '400px';
    container.style.height = '300px';
    document.body.appendChild(container);

    TestBed.configureTestingModule({
      providers: [
        CurationMapService,
        { provide: CARTO_CONFIG, useValue: 'test-carto-key' },
      ],
    });

    service = TestBed.inject(CurationMapService);
    service.initializeMap(container, [47.5, 9.5], 6);
  });

  afterEach(() => {
    service.disposeMap();
    container.remove();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should render tracking points, handle flags and add them to layers', () => {
    const mockRecords: TrackingPoint[] = [
      {
        id: 'cur-1',
        individualId: 'subject-A',
        timestamp: new Date().toISOString(),
        latitude: 47.5,
        longitude: 9.5,
        speedKmH: 15.5,
        accuracyMeters: 5,
        isFlagged: false,
      },
      {
        id: 'cur-2',
        individualId: 'subject-A',
        timestamp: new Date().toISOString(),
        latitude: 47.6,
        longitude: 9.6,
        speedKmH: 120.0,
        accuracyMeters: 50,
        isFlagged: true,
        flagReason: 'Excessive speed',
      },
    ];

    const mapService = service as unknown as {
      markerLayerGroup: L.LayerGroup;
      vectorLayerGroup: L.LayerGroup;
    };

    const addLayerSpy = vi.spyOn(mapService.markerLayerGroup, 'addLayer');
    const polylineAddSpy = vi.spyOn(mapService.vectorLayerGroup, 'addLayer');

    service.renderTrackingPoints(mockRecords);

    // Expect markers for both records + polyline connecting them
    expect(addLayerSpy).toHaveBeenCalledTimes(2);
    expect(polylineAddSpy).toHaveBeenCalledTimes(1);
  });

  it('should clear existing layers before rendering new curation data', () => {
    const mapService = service as unknown as { clearLayers: () => void };
    const clearSpy = vi.spyOn(mapService, 'clearLayers');

    const mockRecords: TrackingPoint[] = [
      {
        id: 'cur-1',
        individualId: 'subject-B',
        timestamp: new Date().toISOString(),
        latitude: 48.0,
        longitude: 10.0,
        speedKmH: 10.0,
        accuracyMeters: 3,
        isFlagged: false,
      },
    ];

    service.renderTrackingPoints(mockRecords);

    expect(clearSpy).toHaveBeenCalled();
  });
});
