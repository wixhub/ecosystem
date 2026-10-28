/// <reference types="vitest/globals" />

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach } from 'vitest';

import { TelemetryAnalytics } from './telemetry-analytics';
import { BioTelemetryRecord } from '@es/data-access';

describe('TelemetryAnalytics', () => {
  let component: TelemetryAnalytics;
  let fixture: ComponentFixture<TelemetryAnalytics>;

  const mockRecords: BioTelemetryRecord[] = [
    {
      id: 'rec-1',
      subjectId: 'sub-1',
      species: 'AVIAN_MIGRATORY',
      timestamp: '2026-01-01T00:00:00Z',
      coordinates: { lat: 10, lng: 20 },
      telemetry: { heartRateBpm: 120, bodyTemperatureC: 39, activityLevelIndex: 5 },
    },
    {
      id: 'rec-2',
      subjectId: 'sub-2',
      species: 'MARINE_CETACEAN',
      timestamp: '2026-01-01T00:01:00Z',
      coordinates: { lat: 11, lng: 21 },
      telemetry: { heartRateBpm: 60, bodyTemperatureC: 36, activityLevelIndex: 2 },
    },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TelemetryAnalytics],
    }).compileComponents();

    fixture = TestBed.createComponent(TelemetryAnalytics);
    component = fixture.componentInstance;
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should accept records via input signal', () => {
    // Bind required input using componentRef or fixture input binding (Angular 17+ style)
    fixture.componentRef.setInput('records', mockRecords);
    fixture.detectChanges();

    expect(component.records()).toEqual(mockRecords);
    expect(component.records().length).toBe(2);
  });
});
