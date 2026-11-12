import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Header, HeaderStateService } from './header';

describe('Header', () => {
  let component: Header;
  let fixture: ComponentFixture<Header>;
  let mockStateService: HeaderStateService;

  beforeEach(async () => {
    // Create type-safe mock functions using Vitest
    mockStateService = {
      loadRawFile: vi.fn(),
      exportData: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [Header],
    }).compileComponents();

    fixture = TestBed.createComponent(Header);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the header component', () => {
    expect(component).toBeTruthy();
  });

  it('should render brand title and subtitle', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const title = compiled.querySelector('h1');
    const subtitle = compiled.querySelector('.subtitle');

    expect(title?.textContent).toContain('FaunaQC Studio');
    expect(subtitle?.textContent).toContain('Animal Tracking Curation Engine');
  });

  it('should call loadRawFile on stateService when a file is selected', () => {
    // Pass mock service via signal input
    fixture.componentRef.setInput('stateService', mockStateService);

    const mockFile = new File(['dummy content'], 'test.csv', {
      type: 'text/csv',
    });
    const event = {
      target: {
        files: [mockFile],
      },
    } as unknown as Event;

    component.onFileSelected(event);

    expect(mockStateService.loadRawFile).toHaveBeenCalledWith(mockFile);
  });

  it('should call exportData with csv format when Export CSV button is clicked', () => {
    fixture.componentRef.setInput('stateService', mockStateService);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const exportCsvButton = Array.from(
      compiled.querySelectorAll('button'),
    ).find((btn) => btn.textContent?.includes('Export CSV'));

    exportCsvButton?.click();

    expect(mockStateService.exportData).toHaveBeenCalledWith('csv');
  });
});
