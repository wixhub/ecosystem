import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { DatasetCatalog } from './dataset-catalog';
import { DatasetService, Dataset } from '@es/data-access';

describe('DatasetCatalog', () => {
  let component: DatasetCatalog;
  let datasetServiceMock: {
    getLocalDatasets: ReturnType<typeof vi.fn>;
    getCustomMovebankData: ReturnType<typeof vi.fn>;
    askAiAssistant: ReturnType<typeof vi.fn>;
  };

  const mockDatasets: Dataset[] = [
    {
      id: 'ds-001',
      title: 'Global White Stork Migration Tracking',
      doi: '10.5061/dryad.5f8g2.3',
      abstract: 'Sample telemetry abstract',
      authors: ['Dr. Miriam Weber'],
      discipline: 'Animal Ecology',
      format: 'CSV',
      fileSize: '142 MB',
      publicationDate: '2026-03-12',
      license: 'CC-BY 4.0',
      tags: ['Telemetry', 'Birds'],
      downloadsCount: 1280,
    },
  ];

  beforeEach(async () => {
    // Create a clean mock object using Vitest vi.fn()
    datasetServiceMock = {
      getLocalDatasets: vi.fn().mockReturnValue(of(mockDatasets)),
      getCustomMovebankData: vi.fn().mockReturnValue(of(mockDatasets)),
      askAiAssistant: vi
        .fn()
        .mockReturnValue(
          of({ entity_type: 'event', filters: { taxon_canonical_name: 'Ciconia ciconia' } }),
        ),
    };

    await TestBed.configureTestingModule({
      imports: [DatasetCatalog],
      providers: [{ provide: DatasetService, useValue: datasetServiceMock }],
    }).compileComponents();

    const fixture = TestBed.createComponent(DatasetCatalog);
    component = fixture.componentInstance;
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should load mock data on initialization (ngOnInit)', () => {
    component.ngOnInit();

    expect(datasetServiceMock.getLocalDatasets).toHaveBeenCalled();
    expect(component.datasets()).toEqual(mockDatasets);
    expect(component.activeSource()).toBe('mock');
    expect(component.isLoading()).toBe(false);
    expect(component.errorMessage()).toBeNull();
  });

  it('should handle error when loading mock data fails', () => {
    // Suppress console.error output during expected error test
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {
      /* empty */
    });

    datasetServiceMock.getLocalDatasets.mockReturnValue(
      throwError(() => new Error('Network error')),
    );

    component.loadMockData();

    expect(component.datasets()).toEqual([]);
    expect(component.errorMessage()).toBe('Failed to load local mock datasets.');
    expect(component.isLoading()).toBe(false);

    // Restore console.error
    consoleErrorSpy.mockRestore();
  });

  it('should execute custom live query successfully', () => {
    component.studyId.set('2911276');
    component.loadCustomLiveQuery('event');

    expect(datasetServiceMock.getCustomMovebankData).toHaveBeenCalledWith(
      'event',
      '2911276',
      undefined,
    );
    expect(component.datasets()).toEqual(mockDatasets);
    expect(component.activeSource()).toBe('live');
    expect(component.isLoading()).toBe(false);
  });

  it('should handle AI search query and trigger live query with response params', () => {
    component.aiPrompt.set('Show me white stork events');
    component.onAiSearch();

    expect(datasetServiceMock.askAiAssistant).toHaveBeenCalledWith('Show me white stork events');
    expect(component.entityType()).toBe('event');
    expect(datasetServiceMock.getCustomMovebankData).toHaveBeenCalledWith('event', undefined, {
      taxon_canonical_name: 'Ciconia ciconia',
    });
    expect(component.datasets()).toEqual(mockDatasets);
  });

  it('should not call AI assistant if prompt is empty', () => {
    component.aiPrompt.set('   ');
    component.onAiSearch();

    expect(datasetServiceMock.askAiAssistant).not.toHaveBeenCalled();
  });

  it('should reset all filters and inputs correctly', () => {
    component.aiPrompt.set('test query');
    component.entityType.set('event');
    component.studyId.set('12345');
    component.errorMessage.set('Some error');
    component.datasets.set(mockDatasets);

    component.resetFilters();

    expect(component.aiPrompt()).toBe('');
    expect(component.entityType()).toBe('study');
    expect(component.studyId()).toBe('');
    expect(component.errorMessage()).toBeNull();
    expect(component.datasets()).toEqual([]);
  });
});
