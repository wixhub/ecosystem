import { TestBed } from '@angular/core/testing';
import { DestroyRef } from '@angular/core';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import * as L from 'leaflet';
import { TelemetryMapService } from './telemetry-map.service';
import { BioTelemetryRecord } from '../models/telemetry.model';

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

describe('TelemetryMapService', () => {
  let service: TelemetryMapService;

  const mockRecords: BioTelemetryRecord[] = [
    {
      id: 'rec-1',
      subjectId: 'sub-alpha',
      species: 'AVIAN_MIGRATORY',
      timestamp: '2026-06-01T12:00:00Z',
      coordinates: { lat: 10.0, lng: 20.0 },
      telemetry: {
        heartRateBpm: 120,
        bodyTemperatureC: 39.5,
        activityLevelIndex: 0.8,
      },
    },
    {
      id: 'rec-2',
      subjectId: 'sub-beta',
      species: 'MARINE_CETACEAN',
      timestamp: '2026-06-01T12:05:00Z',
      coordinates: { lat: 11.0, lng: 21.0 },
      telemetry: {
        heartRateBpm: 75,
        bodyTemperatureC: 36.2,
        activityLevelIndex: 0.4,
      },
    },
    {
      id: 'rec-3',
      subjectId: 'sub-gamma',
      species: 'TERRESTRIAL_UNGULATE',
      timestamp: '2026-06-01T12:10:00Z',
      coordinates: { lat: 12.0, lng: 22.0 },
      telemetry: {
        heartRateBpm: 90,
        bodyTemperatureC: 38.0,
        activityLevelIndex: 0.6,
      },
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
        TelemetryMapService,
        { provide: DestroyRef, useValue: destroyRefMock },
      ],
    });

    service = TestBed.inject(TelemetryMapService);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('renderTelemetryPoints', () => {
    it('should do nothing if mapInstance is not initialized', () => {
      // Map hasn't been initialized via initializeMap()
      service.renderTelemetryPoints(mockRecords);

      expect(L.circleMarker).not.toHaveBeenCalled();
    });

    it('should clear layers, create circle markers with species colors, and fit bounds when map is initialized', () => {
      service.initializeMap('map-container');
      service.renderTelemetryPoints(mockRecords);

      // Verify layers were cleared
      const mapInstance = service['mapInstance'] as any;
      // We can check if circleMarker was called for each record with correct colors
      expect(L.circleMarker).toHaveBeenCalledTimes(3);

      // Check avian color (#10b981)
      expect(L.circleMarker).toHaveBeenCalledWith(
        [10.0, 20.0],
        expect.objectContaining({ fillColor: '#10b981', radius: 6 }),
      );

      // Check marine cetacean color (#06b6d4)
      expect(L.circleMarker).toHaveBeenCalledWith(
        [11.0, 21.0],
        expect.objectContaining({ fillColor: '#06b6d4' }),
      );

      // Check terrestrial ungulate color (#f59e0b)
      expect(L.circleMarker).toHaveBeenCalledWith(
        [12.0, 22.0],
        expect.objectContaining({ fillColor: '#f59e0b' }),
      );

      // Verify bounds fitting
      expect(L.latLngBounds).toHaveBeenCalledWith([
        [10.0, 20.0],
        [11.0, 21.0],
        [12.0, 22.0],
      ]);
      expect(mapInstance.fitBounds).toHaveBeenCalled();
    });

    it('should render a polyline if there are 2 or more records', () => {
      service.initializeMap('map-container');
      service.renderTelemetryPoints(mockRecords);

      expect(L.polyline).toHaveBeenCalledWith(
        [
          [10.0, 20.0],
          [11.0, 21.0],
          [12.0, 22.0],
        ],
        expect.objectContaining({ color: '#3b82f6', weight: 2 }),
      );
    });

    it('should not render a polyline if there are fewer than 2 records', () => {
      service.initializeMap('map-container');
      service.renderTelemetryPoints([mockRecords[0]]);

      expect(L.circleMarker).toHaveBeenCalledTimes(1);
      expect(L.polyline).not.toHaveBeenCalled();
    });

    it('should assign a fallback color for unknown species types', () => {
      service.initializeMap('map-container');
      const unknownRecord: BioTelemetryRecord = {
        ...mockRecords[0],
        species: 'UNKNOWN_SPECIES' as any,
      };

      service.renderTelemetryPoints([unknownRecord]);

      expect(L.circleMarker).toHaveBeenCalledWith(
        [10.0, 20.0],
        expect.objectContaining({ fillColor: '#6366f1' }),
      );
    });
  });
});
