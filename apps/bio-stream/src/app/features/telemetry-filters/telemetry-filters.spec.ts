/// <reference types="vitest/globals" />

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach, vi } from 'vitest';

import { TelemetryFilters } from './telemetry-filters';

describe('TelemetryFilters', () => {
  let component: TelemetryFilters;
  let fixture: ComponentFixture<TelemetryFilters>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TelemetryFilters],
    }).compileComponents();

    fixture = TestBed.createComponent(TelemetryFilters);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should have correct initial default signal states', () => {
    expect(component.species()).toBe('ALL');
    expect(component.minHeartRate()).toBe(40);
    expect(component.maxHeartRate()).toBe(180);
    expect(component.liveStreamEnabled()).toBe(true);
  });

  describe('Event Handlers and Output Emissions', () => {
    it('should update species signal and emit filterChange when onSpeciesChange is called', () => {
      const emitSpy = vi.spyOn(component.filterChange, 'emit');

      const mockEvent = {
        target: { value: 'MARINE_CETACEAN' },
      } as unknown as Event;

      component.onSpeciesChange(mockEvent);

      expect(component.species()).toBe('MARINE_CETACEAN');
      expect(emitSpy).toHaveBeenCalledWith({
        species: 'MARINE_CETACEAN',
        minHeartRate: 40,
        maxHeartRate: 180,
        liveStreamEnabled: true,
      });
    });

    it('should update minHeartRate signal and emit filterChange when onMinHeartRateChange is called', () => {
      const emitSpy = vi.spyOn(component.filterChange, 'emit');

      const mockEvent = {
        target: { value: '65' },
      } as unknown as Event;

      component.onMinHeartRateChange(mockEvent);

      expect(component.minHeartRate()).toBe(65);
      expect(emitSpy).toHaveBeenCalledWith({
        species: 'ALL',
        minHeartRate: 65,
        maxHeartRate: 180,
        liveStreamEnabled: true,
      });
    });

    it('should update maxHeartRate signal and emit filterChange when onMaxHeartRateChange is called', () => {
      const emitSpy = vi.spyOn(component.filterChange, 'emit');

      const mockEvent = {
        target: { value: '150' },
      } as unknown as Event;

      component.onMaxHeartRateChange(mockEvent);

      expect(component.maxHeartRate()).toBe(150);
      expect(emitSpy).toHaveBeenCalledWith({
        species: 'ALL',
        minHeartRate: 40,
        maxHeartRate: 150,
        liveStreamEnabled: true,
      });
    });

    it('should update liveStreamEnabled signal and emit filterChange when onLiveStreamChange is called', () => {
      const emitSpy = vi.spyOn(component.filterChange, 'emit');

      const mockEvent = {
        target: { checked: false },
      } as unknown as Event;

      component.onLiveStreamChange(mockEvent);

      expect(component.liveStreamEnabled()).toBe(false);
      expect(emitSpy).toHaveBeenCalledWith({
        species: 'ALL',
        minHeartRate: 40,
        maxHeartRate: 180,
        liveStreamEnabled: false,
      });
    });
  });
});
