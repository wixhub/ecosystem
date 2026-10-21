/// <reference types="vitest/globals" />

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal, WritableSignal } from '@angular/core';
import { MapContainer } from './map-container';
import { TelemetryMapService, TelemetryStreamService } from '@es/data-access';

// Mock CARTO_API_KEY to prevent unresolved external import errors in tests
vi.mock('@es/config', () => ({
  CARTO_API_KEY: 'mock-carto-api-key',
}));

describe('MapContainer', () => {
  let component: MapContainer;
  let fixture: ComponentFixture<MapContainer>;
  let mapServiceMock: Partial<TelemetryMapService>;
  let telemetryServiceMock: Partial<TelemetryStreamService>;

  // Writable signals to match service reactive state precisely in tests
  let liveErrorSignal: WritableSignal<string | null>;
  let telemetryRecordsSignal: WritableSignal<any[]>;
  let isLoadingSignal: WritableSignal<boolean>;
  let useMockFallbackSignal: WritableSignal<boolean>;

  beforeEach(async () => {
    // Initialize writable mock signals
    liveErrorSignal = signal<string | null>(null);
    telemetryRecordsSignal = signal<any[]>([]);
    isLoadingSignal = signal<boolean>(false);
    useMockFallbackSignal = signal<boolean>(false);

    // Setup mock implementation for TelemetryMapService
    mapServiceMock = {
      initializeMap: vi.fn(),
      renderTelemetryPoints: vi.fn(),
    };

    // Setup mock implementation for TelemetryStreamService
    telemetryServiceMock = {
      liveError: liveErrorSignal,
      telemetryRecords: telemetryRecordsSignal,
      isLoading: isLoadingSignal,
      useMockFallback: useMockFallbackSignal,
      setStudyId: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [MapContainer],
      providers: [
        { provide: TelemetryMapService, useValue: mapServiceMock },
        { provide: TelemetryStreamService, useValue: telemetryServiceMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(MapContainer);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    vi.clearAllMocks();
    liveErrorSignal.set(null);
    telemetryRecordsSignal.set([]);
    isLoadingSignal.set(false);
    useMockFallbackSignal.set(false);
  });

  /**
   * Test case: Component creation
   */
  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  /**
   * Test case: Map initialization and default data fetch on view init
   */
  it('should initialize map and fetch default study telemetry on ngAfterViewInit', () => {
    fixture.detectChanges(); // triggers ngAfterViewInit lifecycle hook

    expect(mapServiceMock.initializeMap).toHaveBeenCalledWith(
      'leaflet-spatial-canvas',
      expect.any(String), // Accepts any generated or mocked CARTO key
      [15.0, 10.0],
      3,
    );
    expect(telemetryServiceMock.setStudyId).toHaveBeenCalledWith('2911040');
  });

  /**
   * Test case: Telemetry record filtering based on species and heart rate rules
   */
  it('should filter telemetry records based on active filters', () => {
    const mockRecords = [
      {
        id: 'rec-1',
        subjectId: 'sub-1',
        species: 'AVIAN_MIGRATORY',
        timestamp: new Date().toISOString(),
        telemetry: { heartRateBpm: 100, bodyTemperatureC: 38, activityLevelIndex: 0.5 },
        coordinates: { lat: 10, lng: 10 },
      },
      {
        id: 'rec-2',
        subjectId: 'sub-2',
        species: 'MARINE_CETACEAN',
        timestamp: new Date().toISOString(),
        telemetry: { heartRateBpm: 10, bodyTemperatureC: 38, activityLevelIndex: 0.5 }, // Below min heart rate filter (20)
        coordinates: { lat: 20, lng: 20 },
      },
    ];

    telemetryRecordsSignal.set(mockRecords);
    fixture.detectChanges();

    expect(component.filteredRecords().length).toBe(1);
    expect(component.filteredRecords()[0].id).toBe('rec-1');
    expect(mapServiceMock.renderTelemetryPoints).toHaveBeenCalledWith(component.filteredRecords());
  });

  /**
   * Test case: Handling stream errors and automatic fallback to default study
   */
  it('should handle live stream errors and fallback if study is not default', () => {
    // Explicitly set a non-default study ID first to trigger the fallback branch
    component.selectedStudyId.set('9999999');

    // Simulate live stream error
    liveErrorSignal.set('Upstream error');
    fixture.detectChanges();

    expect(component.selectedStudyId()).toBe('2911040');
    expect(telemetryServiceMock.setStudyId).toHaveBeenCalledWith('2911040');
    expect(component.errorMessage()).toContain('returned no data or failed');
  });

  /**
   * Test case: Manual error message dismissal
   */
  it('should dismiss error message when dismissError is called', () => {
    component.errorMessage.set('Test error');
    expect(component.errorMessage()).toBe('Test error');

    component.dismissError();
    expect(component.errorMessage()).toBeNull();
  });

  /**
   * Test case: Updating study ID from user input event
   */
  it('should update selected study ID on study change event', () => {
    const mockEvent = {
      target: { value: '1234567' },
    } as unknown as Event;

    component.onStudyChange(mockEvent);
    expect(component.selectedStudyId()).toBe('1234567');
  });

  /**
   * Test case: Updating analytics filters
   */
  it('should update filters when onFilterUpdated is called', () => {
    const newFilters = {
      species: 'MARINE_CETACEAN' as const,
      minHeartRate: 50,
      maxHeartRate: 150,
      liveStreamEnabled: true,
    };

    component.onFilterUpdated(newFilters);
    expect(component.filters()).toEqual(newFilters);
  });
});
