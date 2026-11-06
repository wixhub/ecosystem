/// <reference types="vitest/globals" />

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal, WritableSignal } from '@angular/core';
import { MapContainer } from './map-container';
import { BioTelemetryRecord, StreamMapService } from '@es/map-access';
import { TelemetryStreamService } from '@es/data-access';

describe('MapContainer', () => {
  let component: MapContainer;
  let fixture: ComponentFixture<MapContainer>;

  let mockMapService: {
    initializeMap: ReturnType<typeof vi.fn>;
    renderTelemetryPoints: ReturnType<typeof vi.fn>;
  };

  let mockTelemetryService: {
    liveError: WritableSignal<string | null>;
    telemetryRecords: WritableSignal<BioTelemetryRecord[]>;
    isLoading: WritableSignal<boolean>;
    setStudyId: ReturnType<typeof vi.fn>;
  };

  const sampleRecords: BioTelemetryRecord[] = [
    {
      id: 'rec-1',
      subjectId: 'sub-1',
      species: 'AVIAN_MIGRATORY',
      timestamp: '2026-06-01T00:00:00.000Z',
      latitude: 10,
      longitude: 20,
      telemetry: {
        heartRateBpm: 60,
        bodyTemperatureC: 38.5,
        activityLevelIndex: 5,
      },
    },
    {
      id: 'rec-2',
      subjectId: 'sub-2',
      species: 'MARINE_CETACEAN',
      timestamp: '2026-06-01T01:00:00.000Z',
      latitude: 15,
      longitude: 25,
      telemetry: {
        heartRateBpm: 150,
        bodyTemperatureC: 36.2,
        activityLevelIndex: 8,
      },
    },
  ];

  beforeEach(async () => {
    vi.useFakeTimers();

    mockMapService = {
      initializeMap: vi.fn(),
      renderTelemetryPoints: vi.fn(),
    };

    mockTelemetryService = {
      liveError: signal<string | null>(null),
      telemetryRecords: signal<BioTelemetryRecord[]>([]),
      isLoading: signal<boolean>(false),
      setStudyId: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [MapContainer],
      providers: [
        { provide: StreamMapService, useValue: mockMapService },
        { provide: TelemetryStreamService, useValue: mockTelemetryService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(MapContainer);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  describe('Lifecycle (ngAfterViewInit & ngOnDestroy)', () => {
    it('should initialize the map and set default study ID on ngAfterViewInit', () => {
      fixture.detectChanges();
      component.ngAfterViewInit();

      expect(mockMapService.initializeMap).toHaveBeenCalledWith(
        'leaflet-spatial-canvas',
        [15.0, 10.0],
        3,
      );
      expect(mockTelemetryService.setStudyId).toHaveBeenCalledWith('2911040');
    });

    it('should clear error timeout on destroy if active', () => {
      fixture.detectChanges();
      mockTelemetryService.liveError.set('Test Error');
      fixture.detectChanges();

      const clearSpy = vi.spyOn(window, 'clearTimeout');
      component.ngOnDestroy();

      expect(clearSpy).toHaveBeenCalled();
      expect(component).toBeTruthy();
    });
  });

  describe('Effects & Filtering', () => {
    it('should filter telemetry records by species and heart rate bounds', () => {
      fixture.detectChanges();
      mockTelemetryService.telemetryRecords.set(sampleRecords);

      component.onFilterUpdated({
        species: 'AVIAN_MIGRATORY',
        minHeartRate: 40,
        maxHeartRate: 100,
        liveStreamEnabled: true,
      });

      fixture.detectChanges();

      const filtered = component.filteredRecords();
      expect(filtered.length).toBe(1);
      expect(filtered[0].id).toBe('rec-1');
      expect(mockMapService.renderTelemetryPoints).toHaveBeenCalledWith(filtered);
    });

    it('should return empty records if liveStreamEnabled is false', () => {
      fixture.detectChanges();
      mockTelemetryService.telemetryRecords.set(sampleRecords);

      component.onFilterUpdated({
        species: 'ALL',
        minHeartRate: 0,
        maxHeartRate: 300,
        liveStreamEnabled: false,
      });

      fixture.detectChanges();

      expect(component.filteredRecords()).toEqual([]);
    });
  });

  describe('Error Handling and Study Fallback', () => {
    it('should show auto-closing error when default study (2911040) fails', () => {
      fixture.detectChanges();
      component.selectedStudyId.set('2911040');

      mockTelemetryService.liveError.set('Network Error');
      fixture.detectChanges();

      expect(component.errorMessage()).toContain('Study ID "2911040" returned no data or failed');

      vi.advanceTimersByTime(12_000);
      expect(component.errorMessage()).toBeNull();
    });

    it('should fallback to default study (2911040) when a custom study fails', () => {
      fixture.detectChanges();
      component.selectedStudyId.set('CUSTOM_999');

      mockTelemetryService.liveError.set('API Limit Exceeded');
      fixture.detectChanges();

      expect(component.selectedStudyId()).toBe('2911040');
      expect(mockTelemetryService.setStudyId).toHaveBeenCalledWith('2911040');
      expect(component.errorMessage()).toContain('Study ID "2911040" returned no data or failed');
    });
  });

  describe('User Actions', () => {
    it('should update selectedStudyId when onStudyChange is called', () => {
      const dummyEvent = {
        target: { value: '123456' },
      } as unknown as Event;

      component.onStudyChange(dummyEvent);
      expect(component.selectedStudyId()).toBe('123456');
    });

    it('should dismiss error manually', () => {
      component.dismissError();
      expect(component.errorMessage()).toBeNull();
    });

    it('should switch live dataset successfully', () => {
      component.switchToLiveDataset('55555');
      expect(mockTelemetryService.setStudyId).toHaveBeenCalledWith('55555');
      expect(component.errorMessage()).toBeNull();
    });
  });
});
