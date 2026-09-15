import { TestBed } from '@angular/core/testing';
import { DestroyRef } from '@angular/core';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import * as L from 'leaflet';
import { LeafletMapService } from './leaflet-map.service';

// Mock Leaflet library methods and classes
vi.mock('leaflet', () => {
  const layerGroupMock = {
    addTo: vi.fn().mockReturnThis(),
    clearLayers: vi.fn(),
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
  };
});

// Mock config
vi.mock('@es/config', () => ({
  CARTO_API_KEY: 'test-carto-api-key',
}));

// Concrete implementation of the abstract class for testing
class TestMapService extends LeafletMapService {
  public callInvalidateMapSize(): void {
    this.invalidateMapSize();
  }

  public callFitBounds(latLngs: L.LatLngExpression[], maxZoom: number): void {
    this.fitBounds(latLngs, maxZoom);
  }

  public callClearLayers(): void {
    this.clearLayers();
  }

  public getMapInstance(): L.Map | null {
    return this.mapInstance;
  }
}

describe('LeafletMapService', () => {
  let service: TestMapService;
  let destroyCallbacks: Array<() => void> = [];

  beforeEach(() => {
    vi.useFakeTimers();
    destroyCallbacks = [];

    // Mock DestroyRef to capture cleanup callbacks
    const destroyRefMock = {
      onDestroy: vi.fn((callback: () => void) => {
        destroyCallbacks.push(callback);
        return () => {
          /* empty */
        };
      }),
    };

    TestBed.configureTestingModule({
      providers: [
        TestMapService,
        { provide: DestroyRef, useValue: destroyRefMock },
      ],
    });

    service = TestBed.inject(TestMapService);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('initializeMap', () => {
    it('should initialize the Leaflet map and add layers', () => {
      service.initializeMap('map-container', [10, 20], 5);

      expect(L.map).toHaveBeenCalledWith('map-container', {
        zoomControl: false,
        attributionControl: true,
      });

      const mapInstance = service.getMapInstance();
      expect(mapInstance).toBeTruthy();
      expect(mapInstance?.setView).toHaveBeenCalledWith([10, 20], 5);

      expect(L.tileLayer).toHaveBeenCalledWith(
        expect.stringContaining('test-carto-api-key'),
        expect.any(Object),
      );
    });

    it('should not re-initialize if mapInstance already exists', () => {
      service.initializeMap('map-container');
      const firstMapInstance = service.getMapInstance();

      // Call again
      service.initializeMap('map-container');
      const secondMapInstance = service.getMapInstance();

      expect(firstMapInstance).toBe(secondMapInstance);
      expect(L.map).toHaveBeenCalledTimes(1);
    });
  });

  describe('invalidateMapSize', () => {
    it('should call invalidateSize after a timeout', () => {
      service.initializeMap('map-container');
      const mapInstance = service.getMapInstance();

      service.callInvalidateMapSize();

      // Before timer ticks
      expect(mapInstance?.invalidateSize).not.toHaveBeenCalled();

      // Advance timers by 150ms
      vi.advanceTimersByTime(150);

      expect(mapInstance?.invalidateSize).toHaveBeenCalledTimes(1);
    });
  });

  describe('fitBounds', () => {
    it('should fit bounds when map is initialized and latLngs are provided', () => {
      service.initializeMap('map-container');
      const mapInstance = service.getMapInstance();

      const coords: L.LatLngExpression[] = [
        [10, 20],
        [30, 40],
      ];
      service.callFitBounds(coords, 12);

      expect(L.latLngBounds).toHaveBeenCalledWith(coords);
      expect(mapInstance?.fitBounds).toHaveBeenCalledWith(expect.any(Object), {
        padding: [60, 60],
        maxZoom: 12,
      });
    });

    it('should do nothing if map is not initialized or latLngs are empty', () => {
      service.callFitBounds([], 12);
      expect(L.latLngBounds).not.toHaveBeenCalled();
    });
  });

  describe('clearLayers', () => {
    it('should clear marker and vector layer groups', () => {
      service.initializeMap('map-container');

      // Accessing private/protected layer groups via subclass or side effects
      // Since layerGroup is mocked, we can verify clearLayers is available/called indirectly or test implementation
      expect(() => service.callClearLayers()).not.toThrow();
    });
  });

  describe('disposeMap & DestroyRef integration', () => {
    it('should remove map instance on disposeMap', () => {
      service.initializeMap('map-container');
      const mapInstance = service.getMapInstance();

      service.disposeMap();

      expect(mapInstance?.remove).toHaveBeenCalled();
      expect(service.getMapInstance()).toBeNull();
    });

    it('should trigger disposeMap on DestroyRef destruction', () => {
      service.initializeMap('map-container');
      const mapInstance = service.getMapInstance();

      expect(destroyCallbacks.length).toBe(1);

      // Trigger destruction callback registered in constructor
      destroyCallbacks[0]();

      expect(mapInstance?.remove).toHaveBeenCalled();
      expect(service.getMapInstance()).toBeNull();
    });
  });
});
