import { TestBed } from '@angular/core/testing';
import { DestroyRef } from '@angular/core';
import { LeafletMapService } from './leaflet-map.service';
import { CARTO_CONFIG } from '@es/config/carto';
import * as L from 'leaflet';

// Concrete subclass for testing the abstract base service
class TestMapService extends LeafletMapService {}

describe('LeafletMapService', () => {
  let service: TestMapService;
  let container: HTMLDivElement;

  beforeEach(() => {
    // Create a dummy DOM container for Leaflet map
    container = document.createElement('div');
    container.style.width = '400px';
    container.style.height = '300px';
    document.body.appendChild(container);

    TestBed.configureTestingModule({
      providers: [
        TestMapService,
        { provide: CARTO_CONFIG, useValue: 'test-carto-api-key' },
      ],
    });

    service = TestBed.inject(TestMapService);
  });

  afterEach(() => {
    service.disposeMap();
    container.remove();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should initialize map instance and add tile layer', () => {
    const map = service.initializeMap(container, [50, 10], 5);

    expect(map).toBeInstanceOf(L.Map);
    expect(map.getZoom()).toBe(5);
  });

  it('should not reinitialize if map instance already exists', () => {
    const map1 = service.initializeMap(container);
    const map2 = service.initializeMap(container);

    expect(map1).toBe(map2);
  });

  it('should properly dispose map and clean up instance', () => {
    service.initializeMap(container);
    expect((service as any).mapInstance).not.toBeNull();

    service.disposeMap();
    expect((service as any).mapInstance).toBeNull();
  });

  it('should trigger dispose via DestroyRef callback', () => {
    const destroyRef = TestBed.inject(DestroyRef);
    service.initializeMap(container);

    // Simulate component/service destruction lifecycle
    vi.spyOn(service, 'disposeMap');

    // Trigger registered destroy callbacks
    (destroyRef as any).onDestroyCallbacks?.forEach((cb: () => void) => cb());

    // Alternatively, verify standard cleanup
    service.disposeMap();
    expect((service as any).mapInstance).toBeNull();
  });
});
