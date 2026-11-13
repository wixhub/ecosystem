import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HttpEventType, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { MetadataFormat, MetadataApiService, IngestionPayload } from '@es/data-access';

@Component({
  selector: 'app-ingestion-wizard',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './ingestion-wizard.html',
  styleUrl: './ingestion-wizard.scss',
})
export class IngestionWizard {
  private fb = inject(FormBuilder);
  private api = inject(MetadataApiService);
  private router = inject(Router);

  uploading = signal<boolean>(false);
  uploadProgress = signal<number>(0);
  selectedFile = signal<File | null>(null);
  errorMessage = signal<string | null>(null);

  form = this.fb.group({
    format: ['MOVEBANK_XML' as MetadataFormat],
    targetCollection: [''],
  });

  onFileSelected(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    const file = inputElement.files?.[0];
    if (file) {
      this.selectedFile.set(file);
      this.errorMessage.set(null);

      const name = file.name.toLowerCase();
      if (name.includes('movebank') || name.endsWith('.xml')) {
        this.form.patchValue({ format: 'MOVEBANK_XML' });
      } else if (name.includes('dwc') || name.endsWith('.zip')) {
        this.form.patchValue({ format: 'DWC_A' });
      } else if (name.includes('eml')) {
        this.form.patchValue({ format: 'JSON_SCHEMA' });
      }
    }
  }

  onSubmit(): void {
    const file = this.selectedFile();
    if (this.form.invalid || !file) return;

    this.uploading.set(true);
    this.uploadProgress.set(0);
    this.errorMessage.set(null);

    const payload: IngestionPayload = {
      format: (this.form.value.format as MetadataFormat) ?? 'MOVEBANK_XML',
      file: file,
      targetCollection: this.form.value.targetCollection ?? '',
    };

    this.api.uploadDataset(payload).subscribe({
      next: (event: HttpEvent<unknown>) => {
        if (event.type === HttpEventType.UploadProgress && event.total) {
          const percent = Math.round((100 * event.loaded) / event.total);
          this.uploadProgress.set(percent);
        } else if (event.type === HttpEventType.Response) {
          this.uploading.set(false);

          // Refresh resources and redirect on success
          this.api.refresh();
          this.router.navigate(['/dashboard']);
        }
      },
      error: (err: HttpErrorResponse) => {
        this.uploading.set(false);
        this.uploadProgress.set(0);

        // Refresh resources even on error so metrics update immediately
        this.api.refresh();

        const errObj = err.error as { message?: string } | string | null;
        let serverMessage = '';
        if (typeof errObj === 'string') {
          serverMessage = errObj;
        } else if (errObj && typeof errObj === 'object' && 'message' in errObj) {
          serverMessage = errObj.message ?? '';
        }

        this.errorMessage.set(
          serverMessage || err.message || 'Validation failed. Please check your dataset structure.',
        );
      },
    });
  }
}
