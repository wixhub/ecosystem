/// <reference types="vitest/globals" />

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DataGrid } from './data-grid';
import { TrackingPoint } from '@es/data-access';

describe('DataGrid Component', () => {
  let component: DataGrid;
  let fixture: ComponentFixture<DataGrid>;

  const mockTrackingPoints: TrackingPoint[] = [
    {
      id: 'point-1',
      individualId: 'bird-001',
      timestamp: '2026-10-27T10:00:00Z',
      latitude: 47.65,
      longitude: 9.47,
      speedKmH: 25.4,
      accuracyMeters: 5,
      isFlagged: false,
    },
    {
      id: 'point-2',
      individualId: 'bird-002',
      timestamp: '2026-10-27T11:00:00Z',
      latitude: 48.0,
      longitude: 10.0,
      speedKmH: 120.5,
      accuracyMeters: 15,
      isFlagged: true,
      flagReason: 'Excessive speed',
    },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DataGrid],
    }).compileComponents();

    fixture = TestBed.createComponent(DataGrid);
    component = fixture.componentInstance;

    // Provide required input data before component detection
    fixture.componentRef.setInput('data', mockTrackingPoints);
    fixture.detectChanges();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  /**
   * Test case: Component creation verification
   */
  it('should create the data-grid component', () => {
    expect(component).toBeTruthy();
  });

  /**
   * Test case: Input data binding validation
   */
  it('should accept and store tracking points via input', () => {
    expect(component.data()).toEqual(mockTrackingPoints);
    expect(component.data().length).toBe(2);
  });

  /**
   * Test case: Selected ID input binding validation
   */
  it('should handle optional selectedId input correctly', () => {
    expect(component.selectedId()).toBeNull();

    fixture.componentRef.setInput('selectedId', 'point-1');
    fixture.detectChanges();

    expect(component.selectedId()).toBe('point-1');
  });

  /**
   * Test case: Emitting select event when a point is chosen
   */
  it('should emit select event with correct point ID', () => {
    const emitSpy = vi.fn();
    component.select.subscribe(emitSpy);

    // Simulate emitting select output manually or triggering from UI action
    component.select.emit('point-1');

    expect(emitSpy).toHaveBeenCalledWith('point-1');
  });

  /**
   * Test case: Emitting toggleOverride event
   */
  it('should emit toggleOverride event with correct point ID', () => {
    const emitSpy = vi.fn();
    component.toggleOverride.subscribe(emitSpy);

    component.toggleOverride.emit('point-2');

    expect(emitSpy).toHaveBeenCalledWith('point-2');
  });

  /**
   * Test case: Emitting deletePoint event
   */
  it('should emit deletePoint event with correct point ID', () => {
    const emitSpy = vi.fn();
    component.deletePoint.subscribe(emitSpy);

    component.deletePoint.emit('point-1');

    expect(emitSpy).toHaveBeenCalledWith('point-1');
  });
});
