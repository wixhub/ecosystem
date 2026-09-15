import { TestBed } from '@angular/core/testing';
import { DestroyRef } from '@angular/core';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import * as L from 'leaflet';
import { TrackingMapService } from './tracking-map.service';
import { TrackingPoint } from '../models/tracking.model';

// Mock Leaflet library methods and classes
vi.mock('leaflet', () => {
  const markerMock = {
    bindPopup: vi.fn().mockReturnThis(),
  };

  const polylineMock = {};

  const layerGroupMock = {
    addTo: vi.fn().mockReturnThis(),
    clearLayers: vi.fn(),
    addLayer: vi.fn(),
  };

  const mapMock = {
    setView: vi.fn().mockReturnThis(),
    fitBounds: vi.fn(),
    invalidateSize: vi.fn(),
    remove: vi.fn(),
  };

  return {
    map: vi.fn(() => mapMock),
    tileLayer: vi.fn(() => ({
      addTo: vi.fn().mockReturnThis(),
    })),
    layerGroup: vi.fn(() => layerGroupMock),
    latLngBounds: vi.fn((latLngs) => ({ latLngs })),
    circleMarker: vi.fn(() => markerMock),
    polyline: vi.fn(() => polylineMock),
  };
});

// Mock config dependency inherited via base class
vi.mock('@es/config', () => ({
  CARTO_API_KEY: 'test-carto-api-key',
}));

describe('TrackingMapService', () => {
  let service: TrackingMapService;

  const mockPoints: TrackingPoint[] = [
    {
      id: 'p1',
      individualId: 'ind-1',
      timestamp: '2026-06-01T10:00:00Z',
      latitude: 47.5,
      longitude: 9.4,
      speedKmH: 15,
      accuracyMeters: 5,
      isFlagged: false,
    },
    {
      id: 'p2',
      individualId: 'ind-1',
      timestamp: '2026-06-01T11:00:00Z',
      latitude: 47.6,
      longitude: 9.5,
      speedKmH: 35,
      accuracyMeters: 4,
      isFlagged: true,
      flagReason: 'Excessive speed threshold exceeded',
    },
    {
      id: 'p3',
      individualId: 'ind-2',
      timestamp: '2026-06-01T10:00:00Z',
      latitude: 48.0,
      longitude: 10.0,
      speedKmH: 10,
      accuracyMeters: 3,
      isFlagged: false,
    },
  ];

  beforeEach(() => {
    const destroyRefMock = {
      onDestroy: vi.fn().mockReturnValue(() => {
        /* empty */
      }),
    };

    TestBed.configureTestingModule({
      providers: [
        TrackingMapService,
        { provide: DestroyRef, useValue: destroyRefMock },
      ],
    });

    service = TestBed.inject(TrackingMapService);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('renderTrackingPoints', () => {
    it('should do nothing if mapInstance is not initialized', () => {
      service.renderTrackingPoints(mockPoints);

      expect(L.circleMarker).not.toHaveBeenCalled();
    });

    it('should clear layers, create circle markers with specific color logic, and fit bounds when initialized', () => {
      service.initializeMap('map-container');
      service.renderTrackingPoints(mockPoints);

      expect(L.circleMarker).toHaveBeenCalledTimes(3);

      // First point (unflagged) should use deterministic individual palette color
      expect(L.circleMarker).toHaveBeenNthCalledWith(
        1,
        [47.5, 9.4],
        expect.objectContaining({ fillColor: expect.any(String), radius: 6 }),
      );

      // Second point (flagged) should override color to red (#ef4444)
      expect(L.circleMarker).toHaveBeenNthCalledWith(
        2,
        [47.6, 9.5],
        expect.objectContaining({ fillColor: '#ef4444' }),
      );

      // Verify overall bounds fitting
      expect(L.latLngBounds).toHaveBeenCalledWith([
        [47.5, 9.4],
        [47.6, 9.5],
        [48.0, 10.0],
      ]);
    });

    it('should render a polyline for individuals with 2 or more points', () => {
      service.initializeMap('map-container');
      service.renderTrackingPoints(mockPoints);

      // 'ind-1' has 2 points -> creates polyline. 'ind-2' has 1 point -> skips.
      expect(L.polyline).toHaveBeenCalledTimes(1);
      expect(L.polyline).toHaveBeenCalledWith(
        [
          [47.5, 9.4],
          [47.6, 9.5],
        ],
        expect.objectContaining({
          weight: 2.5,
          dashArray: '4, 8',
          opacity: 0.8,
        }),
      );
    });

    it('should not render a polyline for individuals with fewer than 2 points', () => {
      service.initializeMap('map-container');
      // Render only point 3 belonging to 'ind-2'
      service.renderTrackingPoints([mockPoints[2]]);

      expect(L.circleMarker).toHaveBeenCalledTimes(1);
      expect(L.polyline).not.toHaveBeenCalled();
    });
  });
});
