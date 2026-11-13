import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Dashboard } from './dashboard';
import { MetadataApiService } from '@es/data-access';
import { signal, WritableSignal } from '@angular/core';
import { provideRouter } from '@angular/router';
import { DatasetRecord } from '@es/data-access';

describe('Dashboard', () => {
  let component: Dashboard;
  let fixture: ComponentFixture<Dashboard>;

  // Mock datasets for testing
  const mockProcessedDataset: DatasetRecord = {
    id: '1',
    title: 'Test Dataset 1',
    format: 'DWC_A',
    status: 'PROCESSED',
    updatedAt: '2026-03-30T10:00:00Z',
    recordCount: 150,
  };

  const mockFailedDataset: DatasetRecord = {
    id: '2',
    title: 'Test Dataset 2',
    format: 'MOVEBANK_XML',
    status: 'FAILED',
    updatedAt: '2026-03-30T11:00:00Z',
    recordCount: 0,
    validationErrors: ['Invalid schema'],
  };

  // Declare writable mock signals to allow proper tracking in tests
  let datasetsSignal: WritableSignal<DatasetRecord[]>;
  let failedDatasetsSignal: WritableSignal<DatasetRecord[]>;
  let failedValidationsSignal: WritableSignal<number>;

  let mockMetadataApiService: {
    datasetsResource: {
      value: WritableSignal<DatasetRecord[]>;
      isLoading: WritableSignal<boolean>;
    };
    failedDatasetsResource: { value: WritableSignal<DatasetRecord[]> };
    failedValidationsResource: { value: WritableSignal<number> };
  };

  beforeEach(async () => {
    vi.useFakeTimers();

    datasetsSignal = signal<DatasetRecord[]>([mockProcessedDataset]);
    failedDatasetsSignal = signal<DatasetRecord[]>([mockFailedDataset]);
    failedValidationsSignal = signal<number>(1);

    mockMetadataApiService = {
      datasetsResource: {
        value: datasetsSignal,
        isLoading: signal<boolean>(false),
      },
      failedDatasetsResource: {
        value: failedDatasetsSignal,
      },
      failedValidationsResource: {
        value: failedValidationsSignal,
      },
    };

    await TestBed.configureTestingModule({
      imports: [Dashboard],
      providers: [
        provideRouter([]),
        { provide: MetadataApiService, useValue: mockMetadataApiService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Dashboard);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with "success" activeCard and filter successful datasets into the table data source', () => {
    expect(component.activeCard()).toBe('success');
    expect(component.dataSource.data.length).toBe(1);
    expect(component.dataSource.data[0].id).toBe('1');
    expect(component.dataSource.data[0].status).toBe('PROCESSED');
  });

  it('should update table data source when selectCard is called with "failed"', () => {
    component.selectCard('failed');
    fixture.detectChanges(); // Flush the effect queue

    expect(component.activeCard()).toBe('failed');
    expect(component.dataSource.data.length).toBe(1);
    expect(component.dataSource.data[0].id).toBe('2');
    expect(component.dataSource.data[0].status).toBe('FAILED');
  });

  it('should include both success and failed datasets when selectCard is called with "total"', () => {
    component.selectCard('total');
    fixture.detectChanges(); // Flush the effect queue

    expect(component.activeCard()).toBe('total');
    expect(component.dataSource.data.length).toBe(2);
  });

  it('should compute successfulCount and totalDatasetsCount correctly', () => {
    expect(component.successfulCount()).toBe(1);
    expect(component.totalDatasetsCount()).toBe(2);
  });

  it('should decrement the wakeUpCountdown timer over time', () => {
    const initialCountdown = component.wakeUpCountdown();
    expect(initialCountdown).toBe(150);

    vi.advanceTimersByTime(5000);

    expect(component.wakeUpCountdown()).toBe(145);
  });
});
