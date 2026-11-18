import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BuilderService } from '@es/data-access';
import { Header } from './header';

describe('Header', () => {
  let fixture: ComponentFixture<Header>;
  let component: Header;

  const mockBuilderService = {
    reset: vi.fn(),
  };

  beforeEach(async () => {
    vi.clearAllMocks();

    await TestBed.configureTestingModule({
      imports: [Header],
      providers: [{ provide: BuilderService, useValue: mockBuilderService }],
    }).compileComponents();

    fixture = TestBed.createComponent(Header);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
    expect(component.builderService).toBe(mockBuilderService);
  });

  it('should render the header title and subtitle', () => {
    const textContent = fixture.nativeElement.textContent ?? '';
    expect(textContent).toContain('Movebank Specification Builder');
    expect(textContent).toContain(
      'Step-by-step wizard to configure field telemetry parameters for scientific research',
    );
  });
});
