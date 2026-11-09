import { Component, signal } from '@angular/core';
import { Footer } from '../../core/layout/footer/footer';
import { Header } from '../../core/layout/header/header';
import { DatasetGrid } from '../dataset-grid/dataset-grid';
import { Dataset } from '@es/data-access';

@Component({
  selector: 'app-dataset-catalog',
  imports: [Footer, Header, DatasetGrid],
  templateUrl: './dataset-catalog.html',
  styleUrl: './dataset-catalog.scss',
})
export class DatasetCatalog {
  aiPrompt = signal<string>('');
  entityType = signal<string>('study');
  studyId = signal<string>('');
  activeSource = signal<'live' | 'mock'>('live');

  isLoading = signal<boolean>(false);
  errorMessage = signal<string | null>(null);
  datasets = signal<Dataset[]>([]);

  // Trigger AI search query
  onAiSearch(): void {
    console.log('Searching via AI prompt:', this.aiPrompt());
    // Implement your AI search logic here
  }

  // Load data from live Movebank API
  loadCustomLiveQuery(): void {
    this.activeSource.set('live');
    this.isLoading.set(true);
    // Simulate API fetch
    setTimeout(() => {
      this.isLoading.set(false);
    }, 800);
  }

  // Load mock data locally
  loadMockData(): void {
    this.activeSource.set('mock');
    this.isLoading.set(true);
    // Simulate mock data load
    setTimeout(() => {
      this.isLoading.set(false);
    }, 500);
  }

  // Reset all filters and inputs
  resetFilters(): void {
    this.aiPrompt.set('');
    this.entityType.set('study');
    this.studyId.set('');
    this.errorMessage.set(null);
  }
}
