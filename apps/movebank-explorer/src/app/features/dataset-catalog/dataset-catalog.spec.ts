import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DatasetCatalog } from './dataset-catalog';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('DatasetCatalog', () => {
  let component: DatasetCatalog;
  let fixture: ComponentFixture<DatasetCatalog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DatasetCatalog],
      schemas: [NO_ERRORS_SCHEMA], // Ignores unregistered child selectors like Header, Footer, DatasetGrid
    }).compileComponents();

    fixture = TestBed.createComponent(DatasetCatalog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should have default initial signal values', () => {
    expect(component.aiPrompt()).toBe('');
    expect(component.entityType()).toBe('study');
    expect(component.studyId()).toBe('');
    expect(component.activeSource()).toBe('live');
    expect(component.isLoading()).toBe(false);
    expect(component.errorMessage()).toBeNull();
    expect(component.datasets()).toEqual([]);
  });

  it('should log AI search prompt on onAiSearch', () => {
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {
      /* empty */
    });
    component.aiPrompt.set('Find bird migration data');

    component.onAiSearch();

    expect(consoleSpy).toHaveBeenCalledWith('Searching via AI prompt:', 'Find bird migration data');
    consoleSpy.mockRestore();
  });

  it('should set activeSource to live and handle loading state on loadCustomLiveQuery', () => {
    vi.useFakeTimers();

    component.activeSource.set('mock');
    component.loadCustomLiveQuery();

    expect(component.activeSource()).toBe('live');
    expect(component.isLoading()).toBe(true);

    vi.advanceTimersByTime(800);

    expect(component.isLoading()).toBe(false);

    vi.useRealTimers();
  });

  it('should set activeSource to mock and handle loading state on loadMockData', () => {
    vi.useFakeTimers();

    component.loadMockData();

    expect(component.activeSource()).toBe('mock');
    expect(component.isLoading()).toBe(true);

    vi.advanceTimersByTime(500);

    expect(component.isLoading()).toBe(false);

    vi.useRealTimers();
  });

  it('should reset all filters and inputs on resetFilters', () => {
    component.aiPrompt.set('Some prompt');
    component.entityType.set('event');
    component.studyId.set('12345');
    component.errorMessage.set('An error occurred');

    component.resetFilters();

    expect(component.aiPrompt()).toBe('');
    expect(component.entityType()).toBe('study');
    expect(component.studyId()).toBe('');
    expect(component.errorMessage()).toBeNull();
  });
});
