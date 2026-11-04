import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { MetadataApiService } from './metadata-api.service';
import { APP_CONFIG, AppConfig } from '@es/config/api';
import { IngestionPayload } from '../models/metadata.model';
import { effect } from '@angular/core';

describe('MetadataApiService', () => {
  let service: MetadataApiService;
  let httpMock: HttpTestingController;

  const mockConfig: AppConfig = {
    production: false,
    apiUrl: 'http://localhost:8080/api/v1',
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        MetadataApiService,
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: APP_CONFIG, useValue: mockConfig },
      ],
    });

    service = TestBed.inject(MetadataApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('datasetDetailsResource', () => {
    it('should not fetch details when selectedDatasetId is null', () => {
      TestBed.runInInjectionContext(() => {
        effect(() => {
          service.datasetDetailsResource.value();
        });
      });
      httpMock.expectNone(`${mockConfig.apiUrl}/datasets/123`);
    });
  });

  describe('uploadDataset', () => {
    it('should send a multipart/form-data POST request with progress tracking enabled', () => {
      const dummyFile = new File(['content'], 'test.xml', { type: 'text/xml' });
      const payload: IngestionPayload = {
        format: 'MOVEBANK_XML',
        file: dummyFile,
        targetCollection: 'collection-1',
      };

      service.uploadDataset(payload).subscribe();

      const req = httpMock.expectOne(`${mockConfig.apiUrl}/ingest`);
      expect(req.request.method).toBe('POST');
      expect(req.request.reportProgress).toBe(true);
      expect(req.request.body instanceof FormData).toBe(true);
      expect(req.request.body.get('format')).toBe('MOVEBANK_XML');
      expect(req.request.body.get('targetCollection')).toBe('collection-1');
      expect(req.request.body.get('file')).toBeTruthy();

      req.flush({ success: true });
    });
  });
});
