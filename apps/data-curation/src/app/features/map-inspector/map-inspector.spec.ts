/// <reference types="vitest/globals" />

import { ComponentRef } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MapInspector } from './map-inspector';
import { CurationMapService, TrackingPoint } from '@es/map-access';

describe('MapInspector', () => {
  let component: MapInspector;
  let fixture: ComponentFixture<MapInspector>;
  let componentRef: ComponentRef<MapInspector>;
  let mapServiceMock: {
    initializeMap: ReturnType<typeof vi.fn>;
    renderTrackingPoints: ReturnType<typeof vi.fn>;
  };

  const mockTrackingPoints: TrackingPoint[] = [
    {
      id: 'pt-1',
      individualId: 'ind-1',
      timestamp: '2026-01-01T00:00:00Z',
      latitude: 47.65,
      longitude: 9.47,
      accuracyMeters: 5,
      isFlagged: false,
    },
    {
      id: 'pt-2',
      individualId: 'ind-1',
      timestamp: '2026-01-01T01:00:00Z',
      latitude: 47.66,
      longitude: 9.48,
      accuracyMeters: 10,
      isFlagged: true,
      flagReason: 'Speed anomaly',
    },
  ];

  beforeEach(async () => {
    mapServiceMock = {
      initializeMap: vi.fn(),
      renderTrackingPoints: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [MapInspector],
      providers: [{ provide: CurationMapService, useValue: mapServiceMock }],
    }).compileComponents();

    fixture = TestBed.createComponent(MapInspector);
    component = fixture.componentInstance;
    componentRef = fixture.componentRef;

    // Provide required inputs before initial data binding / render
    componentRef.setInput('data', mockTrackingPoints);
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize the map on afterNextRender using the first valid point coordinates', async () => {
    // Trigger change detection and afterNextRender lifecycle
    fixture.detectChanges();
    await fixture.whenStable();

    expect(mapServiceMock.initializeMap).toHaveBeenCalledTimes(1);

    // Verifies that it used the first valid point coordinates [47.65, 9.47]
    const initializeCallArgs = mapServiceMock.initializeMap.mock.calls[0];
    expect(initializeCallArgs[1]).toEqual([47.65, 9.47]);
    expect(initializeCallArgs[2]).toBe(10); // zoom level

    // Verifies points were rendered upon initialization
    expect(mapServiceMock.renderTrackingPoints).toHaveBeenCalledWith(mockTrackingPoints);
  });

  it('should use fallback coordinates when no valid tracking points are provided', async () => {
    componentRef.setInput('data', [
      {
        id: 'invalid-1',
        individualId: 'ind-1',
        timestamp: '2026-01-01T00:00:00Z',
        latitude: NaN,
        longitude: NaN,
        accuracyMeters: 5,
        isFlagged: false,
      },
    ]);

    fixture.detectChanges();
    await fixture.whenStable();

    expect(mapServiceMock.initializeMap).toHaveBeenCalledTimes(1);
    const initializeCallArgs = mapServiceMock.initializeMap.mock.calls[0];

    // Fallback coordinates [47.65, 9.47]
    expect(initializeCallArgs[1]).toEqual([47.65, 9.47]);
  });

  it('should re-render tracking points when data input changes via effect', async () => {
    // Initialize map first
    fixture.detectChanges();
    await fixture.whenStable();

    expect(mapServiceMock.renderTrackingPoints).toHaveBeenCalledTimes(1);

    // Update data signal input
    const updatedPoints: TrackingPoint[] = [
      {
        id: 'pt-3',
        individualId: 'ind-2',
        timestamp: '2026-01-01T02:00:00Z',
        latitude: 48.0,
        longitude: 10.0,
        accuracyMeters: 3,
        isFlagged: false,
      },
    ];

    componentRef.setInput('data', updatedPoints);
    fixture.detectChanges();
    await fixture.whenStable();

    // Effect should trigger renderTrackingPoints with new points
    expect(mapServiceMock.renderTrackingPoints).toHaveBeenCalledTimes(2);
    expect(mapServiceMock.renderTrackingPoints).toHaveBeenLastCalledWith(updatedPoints);
  });
});
