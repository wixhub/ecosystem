import { TestBed } from '@angular/core/testing';
import { SpatialMapService } from './spatial-map.service';
import { CARTO_CONFIG } from '@es/config/carto';
import { AnimalTrack } from './spatial.model';
import * as L from 'leaflet';

describe('SpatialMapService', () => {
  let service: SpatialMapService;
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement('div');
    container.style.width = '400px';
    container.style.height = '300px';
    document.body.appendChild(container);

    TestBed.configureTestingModule({
      providers: [
        SpatialMapService,
        { provide: CARTO_CONFIG, useValue: 'test-carto-key' },
      ],
    });

    service = TestBed.inject(SpatialMapService);
    service.initializeMap(container, [47.5, 9.5], 6);
  });

  afterEach(() => {
    service.disposeMap();
    container.remove();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should rebuild static tracks and add polylines to map', () => {
    const mockTracks: AnimalTrack[] = [
      {
        individualId: 'track-1',
        speciesName: 'Ciconia ciconia',
        commonName: 'White Stork',
        tagDeployDate: new Date().toISOString(),
        color: '#38bdf8',
        points: [
          {
            id: 'p-1',
            individualId: 'track-1',
            timestamp: Date.now(),
            latitude: 47.5,
            longitude: 9.5,
            sensorType: 'GPS',
          },
          {
            id: 'p-2',
            individualId: 'track-1',
            timestamp: Date.now() + 1000,
            latitude: 47.6,
            longitude: 9.6,
            sensorType: 'GPS',
          },
        ],
      },
    ];

    const mapInstance = (service as unknown as { mapInstance: L.Map })
      .mapInstance;
    const addLayerSpy = vi.spyOn(mapInstance, 'addLayer');

    service.rebuildStaticTracks(mockTracks);

    expect(addLayerSpy).toHaveBeenCalled();
  });

  it('should update map entities and render current positions', () => {
    const mockTrack: AnimalTrack = {
      individualId: 'track-1',
      speciesName: 'Ciconia ciconia',
      commonName: 'White Stork',
      tagDeployDate: new Date().toISOString(),
      color: '#38bdf8',
      points: [
        {
          id: 'p-1',
          individualId: 'track-1',
          timestamp: Date.now(),
          latitude: 47.5,
          longitude: 9.5,
          sensorType: 'GPS',
        },
      ],
    };

    const positions = [
      {
        track: mockTrack,
        currentPoint: mockTrack.points[0],
        trail: mockTrack.points,
      },
    ];

    const mapInstance = (service as unknown as { mapInstance: L.Map })
      .mapInstance;
    const addLayerSpy = vi.spyOn(mapInstance, 'addLayer');

    service.updateMapEntities(positions);

    expect(addLayerSpy).toHaveBeenCalled();
  });
});
