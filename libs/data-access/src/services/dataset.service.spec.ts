import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  provideHttpClientTesting,
  HttpTestingController,
} from '@angular/common/http/testing';
import { firstValueFrom } from 'rxjs';
import { DatasetService } from './dataset.service';
import { workerConfig } from '@es/config/worker';
import MOCK_DATASETS from '../mocks/datasets.json';

describe('DatasetService', () => {
  let service: DatasetService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        DatasetService,
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });

    service = TestBed.inject(DatasetService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    // Verify that there are no outstanding HTTP requests after each test
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should fetch local mock datasets', async () => {
    const datasets = await firstValueFrom(service.getLocalDatasets());
    expect(datasets).toEqual(MOCK_DATASETS);
    expect(datasets.length).toBeGreaterThan(0);
  });

  it('should fetch custom movebank data successfully (CSV response)', async () => {
    const csvResponse =
      'id,name,taxon,location_lat,location_long,timestamp\n' +
      '123,White Stork Test,Ciconia ciconia,52.52,13.40,2026-03-12T10:00:00Z';

    const datasetsPromise = firstValueFrom(
      service.getCustomMovebankData('event', '2911276'),
    );

    const req = httpMock.expectOne(
      (request) =>
        request.url === workerConfig.workerBaseUrl &&
        request.params.get('entity_type') === 'event' &&
        request.params.get('study_id') === '2911276',
    );
    expect(req.request.method).toBe('GET');
    req.flush(csvResponse);

    const datasets = await datasetsPromise;
    expect(datasets.length).toBe(1);
    expect(datasets[0].title).toBe('White Stork Test');
    expect(datasets[0].discipline).toBe('Wildlife Telemetry');
  });

  it('should fallback to error notice dataset when custom query fails', async () => {
    // Suppress expected console.error during error handling test
    const consoleErrorSpy = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {
        /* empty */
      });

    const datasetsPromise = firstValueFrom(
      service.getCustomMovebankData('event', 'invalid-id'),
    );

    const req = httpMock.expectOne(
      (request) => request.url === workerConfig.workerBaseUrl,
    );
    req.flush('Server Error', {
      status: 500,
      statusText: 'Internal Server Error',
    });

    const datasets = await datasetsPromise;
    expect(datasets.length).toBe(1);
    expect(datasets[0].id).toBe('error-notice');
    expect(datasets[0].title).toBe('Movebank Access Restriction Notice');

    consoleErrorSpy.mockRestore();
  });

  it('should send natural language prompt to AI assistant endpoint', async () => {
    const mockAiResponse = {
      entity_type: 'event',
      filters: { taxon_canonical_name: 'Ciconia ciconia' },
    };

    const promptText = 'Track Ciconia ciconia migration';

    const responsePromise = firstValueFrom(service.askAiAssistant(promptText));

    const req = httpMock.expectOne(
      `${workerConfig.workerBaseUrl}/api/ai-query`,
    );
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ prompt: promptText });
    req.flush(mockAiResponse);

    const response = await responsePromise;
    expect(response).toEqual(mockAiResponse);
  });
});
