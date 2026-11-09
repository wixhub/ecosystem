import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Header } from './header';

describe('Header', () => {
  let component: Header;
  let fixture: ComponentFixture<Header>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Header],
    }).compileComponents();

    fixture = TestBed.createComponent(Header);
    component = fixture.componentInstance;

    // Set required inputs before first change detection
    fixture.componentRef.setInput('aiPrompt', 'Initial prompt');
    fixture.componentRef.setInput('entityType', 'study');
    fixture.componentRef.setInput('studyId', '12345');
    fixture.componentRef.setInput('activeSource', 'live');
    fixture.componentRef.setInput('datasetsCount', 10);

    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should correctly bind required signal inputs', () => {
    expect(component.aiPrompt()).toBe('Initial prompt');
    expect(component.entityType()).toBe('study');
    expect(component.studyId()).toBe('12345');
    expect(component.activeSource()).toBe('live');
    expect(component.datasetsCount()).toBe(10);
  });

  it('should emit aiPromptChange when onAiInput is triggered', () => {
    const emitSpy = vi.spyOn(component.aiPromptChange, 'emit');
    const mockEvent = {
      target: { value: 'New migration query' },
    } as unknown as Event;

    component.onAiInput(mockEvent);
    expect(emitSpy).toHaveBeenCalledWith('New migration query');
  });

  it('should emit entityTypeChange when onEntityChange is triggered', () => {
    const emitSpy = vi.spyOn(component.entityTypeChange, 'emit');
    const mockEvent = {
      target: { value: 'event' },
    } as unknown as Event;

    component.onEntityChange(mockEvent);
    expect(emitSpy).toHaveBeenCalledWith('event');
  });

  it('should emit studyIdChange when onStudyIdInput is triggered', () => {
    const emitSpy = vi.spyOn(component.studyIdChange, 'emit');
    const mockEvent = {
      target: { value: '98765' },
    } as unknown as Event;

    component.onStudyIdInput(mockEvent);
    expect(emitSpy).toHaveBeenCalledWith('98765');
  });

  it('should emit action outputs when triggered', () => {
    const searchSpy = vi.spyOn(component.aiSearch, 'emit');
    component.aiSearch.emit();
    expect(searchSpy).toHaveBeenCalled();

    const liveSpy = vi.spyOn(component.loadLive, 'emit');
    component.loadLive.emit();
    expect(liveSpy).toHaveBeenCalled();

    const mockSpy = vi.spyOn(component.loadMock, 'emit');
    component.loadMock.emit();
    expect(mockSpy).toHaveBeenCalled();

    const resetSpy = vi.spyOn(component.reset, 'emit');
    component.reset.emit();
    expect(resetSpy).toHaveBeenCalled();
  });
});
