import { Component, inject, OnInit, signal } from '@angular/core';
import { Footer } from '../../core/layout/footer/footer';
import { Header } from '../../core/layout/header/header';
import { DatasetGrid } from '../dataset-grid/dataset-grid';
import { Dataset, DatasetService } from '@es/data-access';

@Component({
  selector: 'app-dataset-catalog',
  imports: [Footer, Header, DatasetGrid],
  templateUrl: './dataset-catalog.html',
  styleUrl: './dataset-catalog.scss',
})
export class DatasetCatalog implements OnInit {
  // Inject the DatasetService using Angular's inject function
  private readonly datasetService = inject(DatasetService);

  aiPrompt = signal<string>('');
  entityType = signal<string>('study');
  studyId = signal<string>('');
  activeSource = signal<'live' | 'mock'>('live');

  isLoading = signal<boolean>(false);
  errorMessage = signal<string | null>(null);
  datasets = signal<Dataset[]>([]);

  /**
   * Lifecycle hook triggered on component initialization
   */
  ngOnInit(): void {
    // Automatically load data on first load (e.g., loading mock or default live data)
    this.loadMockData();
    // Live Data
    // this.loadCustomLiveQuery();
  }

  /**
   * Trigger AI search query using the service's AI assistant method
   */
  onAiSearch(): void {
    const promptText = this.aiPrompt().trim();
    if (!promptText) return;

    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.datasetService.askAiAssistant(promptText).subscribe({
      next: (response) => {
        this.entityType.set(response.entity_type);
        // Execute live query using parsed parameters from AI response
        this.loadCustomLiveQuery(response.entity_type, response.filters);
      },
      error: (error: unknown) => {
        console.error('AI query failed', error);
        this.errorMessage.set('Failed to process AI query. Please try again.');
        this.isLoading.set(false);
      },
    });
  }

  /**
   * Load data from live Movebank API via DatasetService
   */
  loadCustomLiveQuery(entity: string = this.entityType(), filters?: Record<string, string>): void {
    this.activeSource.set('live');
    this.isLoading.set(true);
    this.errorMessage.set(null);

    const currentStudyId = this.studyId().trim();

    this.datasetService
      .getCustomMovebankData(entity, currentStudyId || undefined, filters)
      .subscribe({
        next: (data) => {
          this.datasets.set(data);
          this.isLoading.set(false);
        },
        error: (error: unknown) => {
          console.error('Failed to load live datasets', error);
          this.errorMessage.set('Failed to load data from Movebank API.');
          this.isLoading.set(false);
        },
      });
  }

  /**
   * Load mock data locally via DatasetService
   */
  loadMockData(): void {
    this.activeSource.set('mock');
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.datasetService.getLocalDatasets().subscribe({
      next: (data) => {
        this.datasets.set(data);
        this.isLoading.set(false);
      },
      error: (error: unknown) => {
        console.error('Failed to load local mock datasets', error);
        this.errorMessage.set('Failed to load local mock datasets.');
        this.isLoading.set(false);
      },
    });
  }

  /**
   * Reset all filters and inputs
   */
  resetFilters(): void {
    this.aiPrompt.set('');
    this.entityType.set('study');
    this.studyId.set('');
    this.errorMessage.set(null);
    this.datasets.set([]);
  }
}
