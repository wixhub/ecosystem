/// <reference types="vitest/globals" />

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MapInspector } from './map-inspector';
import { TrackingMapService } from '@es/data-access';

vi.mock('@es/config', () => ({
  CARTO_API_KEY: 'mock-carto-api-key',
}));

describe('MapInspector', () => {
  let component: MapInspector;
  let fixture: ComponentFixture<MapInspector>;
  let mapServiceMock: Partial<TrackingMapService>;

  const mockTrackingPoints = [
    {
      id: 'p1',
      individualId: 'ind-1',
      timestamp: new Date().toISOString(),
      latitude: 47.65,
      longitude: 9.47,
      accuracyMeters: 5,
      isFlagged: false,
    },
    {
      id: 'p2',
      individualId: 'ind-2',
      timestamp: new Date().toISOString(),
      latitude: 48.0,
      longitude: 10.0,
      accuracyMeters: 10,
      isFlagged: true,
    },
  ];

  beforeEach(async () => {
    mapServiceMock = {
      initializeMap: vi.fn(),
      renderTrackingPoints: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [MapInspector],
      providers: [{ provide: TrackingMapService, useValue: mapServiceMock }],
    }).compileComponents();

    fixture = TestBed.createComponent(MapInspector);
    component = fixture.componentInstance;

    fixture.componentRef.setInput('data', mockTrackingPoints);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should create the map inspector component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize map with correct container ID, CARTO key, and center coordinates', () => {
    fixture.detectChanges();

    expect(mapServiceMock.initializeMap).toHaveBeenCalledTimes(1);

    expect(mapServiceMock.initializeMap).toHaveBeenCalledWith(
      expect.stringContaining('map-frame-'),
      expect.any(String), // Accepts dynamic/mocked CARTO key safely
      [47.65, 9.47],
      10,
    );

    expect(mapServiceMock.renderTrackingPoints).toHaveBeenCalledWith(mockTrackingPoints);
  });

  it('should re-render tracking points when input data changes', () => {
    fixture.detectChanges();

    const updatedPoints = [
      {
        id: 'p3',
        individualId: 'ind-3',
        timestamp: new Date().toISOString(),
        latitude: 50.0,
        longitude: 8.0,
        accuracyMeters: 3,
        isFlagged: false,
      },
    ];

    fixture.componentRef.setInput('data', updatedPoints);
    fixture.detectChanges();

    expect(mapServiceMock.renderTrackingPoints).toHaveBeenCalledWith(updatedPoints);
  });

  it('should use default fallback center coordinates when points array is empty', () => {
    fixture.componentRef.setInput('data', []);
    fixture.detectChanges();

    expect(mapServiceMock.initializeMap).toHaveBeenCalledWith(
      expect.stringContaining('map-frame-'),
      expect.any(String),
      [47.65, 9.47],
      10,
    );
  });
});
