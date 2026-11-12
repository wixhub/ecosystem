import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MapView } from './map-view';
import { MigrationService } from '@es/data-access';
import { SpatialMapService } from '@es/map-access';

describe('MapView', () => {
  let component: MapView;
  let fixture: ComponentFixture<MapView>;
  let migrationServiceMock: {
    currentPositions: ReturnType<typeof signal>;
    activeTracks: ReturnType<typeof signal>;
    dataset: ReturnType<typeof signal>;
  };
  let spatialMapServiceMock: {
    initializeMap: ReturnType<typeof vi.fn>;
    updateMapEntities: ReturnType<typeof vi.fn>;
    rebuildStaticTracks: ReturnType<typeof vi.fn>;
    fitMapToTracks: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    migrationServiceMock = {
      currentPositions: signal([]),
      activeTracks: signal([]),
      dataset: signal(null),
    };

    spatialMapServiceMock = {
      initializeMap: vi.fn(),
      updateMapEntities: vi.fn(),
      rebuildStaticTracks: vi.fn(),
      fitMapToTracks: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [MapView],
      providers: [
        { provide: MigrationService, useValue: migrationServiceMock },
        { provide: SpatialMapService, useValue: spatialMapServiceMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(MapView);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should update map entities when currentPositions signal changes after initialization', () => {
    // Explicitly type the mock data instead of using 'as any'
    const mockPositions = [
      {
        track: { individualId: 'track-1' },
        currentPoint: { latitude: 10, longitude: 20, timestamp: new Date().toISOString() },
        trail: [],
      },
    ];

    migrationServiceMock.currentPositions.set(mockPositions);
    fixture.detectChanges();

    expect(spatialMapServiceMock.updateMapEntities).toHaveBeenCalledWith(mockPositions);
  });

  it('should rebuild static tracks when activeTracks signal changes', () => {
    const mockTracks = [
      {
        individualId: 'track-1',
        color: '#3b82f6',
        points: [{ latitude: 10, longitude: 20, timestamp: new Date().toISOString() }],
      },
    ];

    migrationServiceMock.activeTracks.set(mockTracks);
    fixture.detectChanges();

    expect(spatialMapServiceMock.rebuildStaticTracks).toHaveBeenCalledWith(mockTracks);
  });

  it('should fit map bounds when a valid dataset is loaded', () => {
    const mockDataset = {
      datasetId: 'dataset-1',
      tracks: [
        {
          individualId: 'track-1',
          color: '#3b82f6',
          points: [{ latitude: 10, longitude: 20, timestamp: new Date().toISOString() }],
        },
      ],
    };

    migrationServiceMock.dataset.set(mockDataset);
    fixture.detectChanges();

    expect(spatialMapServiceMock.fitMapToTracks).toHaveBeenCalledWith(mockDataset.tracks);
  });
});
