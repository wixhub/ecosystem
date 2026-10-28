/// <reference types="vitest/globals" />

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal, WritableSignal } from '@angular/core';
import { Dashboard } from './dashboard';
import { TrackingStateService } from '@es/data-access';

describe('Dashboard Component', () => {
  let component: Dashboard;
  let fixture: ComponentFixture<Dashboard>;
  let stateServiceMock: Partial<TrackingStateService>;

  // Writable signals matching TrackingStateService reactive state used in template
  let filtersSignal: WritableSignal<any>;
  let availableIndividualsSignal: WritableSignal<string[]>;
  let sessionRestoredSignal: WritableSignal<boolean>;
  let viewModeSignal: WritableSignal<string>;
  let filteredDataSignal: WritableSignal<any[]>;
  let selectedPointIdSignal: WritableSignal<string | null>;

  beforeEach(async () => {
    // Initialize mock signals
    filtersSignal = signal({
      selectedIndividual: 'all',
      maxSpeedThreshold: 100,
      showOnlyFlagged: false,
    });
    availableIndividualsSignal = signal(['bird-001', 'bird-002']);
    sessionRestoredSignal = signal(true);
    viewModeSignal = signal('split');
    filteredDataSignal = signal([]);
    selectedPointIdSignal = signal(null);

    // Setup mock implementation for TrackingStateService
    stateServiceMock = {
      filters: filtersSignal,
      availableIndividuals: availableIndividualsSignal,
      sessionRestored: sessionRestoredSignal,
      viewMode: viewModeSignal,
      filteredData: filteredDataSignal,
      selectedPointId: selectedPointIdSignal,
      updateFilters: vi.fn((newFilters) => {
        filtersSignal.set({ ...filtersSignal(), ...newFilters });
      }),
    } as unknown as TrackingStateService;

    await TestBed.configureTestingModule({
      imports: [Dashboard],
      providers: [{ provide: TrackingStateService, useValue: stateServiceMock }],
    }).compileComponents();

    fixture = TestBed.createComponent(Dashboard);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  /**
   * Test case: Component creation verification
   */
  it('should create the dashboard component', () => {
    expect(component).toBeTruthy();
  });

  /**
   * Test case: Handling individual selection change from native select element
   */
  it('should update selected individual filter on change event', () => {
    const mockSelectEvent = {
      target: { value: 'bird-123' },
    } as unknown as Event;

    component.onIndividualChange(mockSelectEvent);

    expect(stateServiceMock.updateFilters).toHaveBeenCalledWith({
      selectedIndividual: 'bird-123',
    });
    expect(component.stateService.filters().selectedIndividual).toBe('bird-123');
  });

  /**
   * Test case: Handling speed threshold limit change from native input element
   */
  it('should update max speed threshold filter on input event', () => {
    const mockInputEvent = {
      target: { value: '75' },
    } as unknown as Event;

    component.onSpeedLimitChange(mockInputEvent);

    expect(stateServiceMock.updateFilters).toHaveBeenCalledWith({
      maxSpeedThreshold: 75,
    });
    expect(component.stateService.filters().maxSpeedThreshold).toBe(75);
  });

  /**
   * Test case: Handling flagged records toggle from native checkbox element
   */
  it('should update showOnlyFlagged filter on checkbox toggle event', () => {
    const mockCheckboxEvent = {
      target: { checked: true },
    } as unknown as Event;

    component.onFlaggedToggle(mockCheckboxEvent);

    expect(stateServiceMock.updateFilters).toHaveBeenCalledWith({
      showOnlyFlagged: true,
    });
    expect(component.stateService.filters().showOnlyFlagged).toBe(true);
  });
});
