/// <reference types="vitest/globals" />

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TelemetryAnalytics } from './telemetry-analytics';
import { BioTelemetryRecord } from '@es/map-access';

describe('TelemetryAnalytics', () => {
  let component: TelemetryAnalytics;
  let fixture: ComponentFixture<TelemetryAnalytics>;

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

  it('should accept and update the required records input', () => {
    // Bind the required input signal
    fixture.componentRef.setInput('records', sampleRecords);
    fixture.detectChanges();

    expect(component.records()).toEqual(sampleRecords);
    expect(component.records().length).toBe(1);
  });
});
