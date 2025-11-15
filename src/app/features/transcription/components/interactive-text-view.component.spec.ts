import { ComponentFixture, TestBed } from '@angular/core/testing';
import { InteractiveTextViewComponent } from './interactive-text-view.component';
import { TextSegmentComponent } from './text-segment.component';
import { TextSegmentOverlayComponent } from './text-segment-overlay.component';

describe('InteractiveTextViewComponent', () => {
  let component: InteractiveTextViewComponent;
  let fixture: ComponentFixture<InteractiveTextViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InteractiveTextViewComponent, TextSegmentComponent, TextSegmentOverlayComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(InteractiveTextViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with word interaction mode', () => {
    expect(component.interactionMode()).toBe('word');
  });

  it('should display empty state when no segments', () => {
    const element = fixture.nativeElement as HTMLElement;
    const emptyState = element.querySelector('.empty-state');
    expect(emptyState).toBeTruthy();
    expect(emptyState?.textContent).toContain('No text to display');
  });

  it('should segment text into words in word mode', () => {
    const mockSegments = [
      { text: 'Hello world', at: 0 },
      { text: 'How are you', at: 1000 }
    ];
    
    fixture.componentRef.setInput('transcriptSegments', mockSegments);
    component.interactionMode.set('word');
    fixture.detectChanges();

    const segments = component.textSegments();
    expect(segments.length).toBeGreaterThan(2); // Should have multiple words
    expect(segments.some(s => s.text === 'Hello')).toBe(true);
    expect(segments.some(s => s.text === 'world')).toBe(true);
  });

  it('should segment text into sentences in sentence mode', () => {
    const mockSegments = [
      { text: 'Hello world', at: 0 },
      { text: 'How are you', at: 1000 }
    ];
    
    fixture.componentRef.setInput('transcriptSegments', mockSegments);
    component.interactionMode.set('sentence');
    fixture.detectChanges();

    const segments = component.textSegments();
    expect(segments.length).toBe(2); // Should have 2 sentences
    expect(segments[0].text).toBe('Hello world');
    expect(segments[1].text).toBe('How are you');
  });

  it('should switch between modes when mode buttons are clicked', () => {
    const buttons = fixture.nativeElement.querySelectorAll('.mode-button');
    expect(buttons.length).toBe(2);

    // Click sentence mode button
    (buttons[1] as HTMLElement).click();
    fixture.detectChanges();
    
    expect(component.interactionMode()).toBe('sentence');

    // Click word mode button
    (buttons[0] as HTMLElement).click();
    fixture.detectChanges();
    
    expect(component.interactionMode()).toBe('word');
  });

  it('should open overlay when segment is clicked', () => {
    const mockSegments = [
      { text: 'Hello world', at: 0 }
    ];
    
    fixture.componentRef.setInput('transcriptSegments', mockSegments);
    fixture.detectChanges();

    const clickEvent = {
      text: 'Hello',
      type: 'word' as const,
      index: 0,
      event: new MouseEvent('click', { clientX: 100, clientY: 100 })
    };

    component.handleSegmentClick(clickEvent);

    expect(component.selectedSegment()).toBeTruthy();
    expect(component.selectedSegment()?.text).toBe('Hello');
  });

  it('should close overlay when closeOverlay is called', () => {
    const mockSegments = [
      { text: 'Hello world', at: 0 }
    ];
    
    fixture.componentRef.setInput('transcriptSegments', mockSegments);
    fixture.detectChanges();

    const clickEvent = {
      text: 'Hello',
      type: 'word' as const,
      index: 0,
      event: new MouseEvent('click', { clientX: 100, clientY: 100 })
    };

    component.handleSegmentClick(clickEvent);
    expect(component.selectedSegment()).toBeTruthy();

    component.closeOverlay();
    expect(component.selectedSegment()).toBeNull();
  });

  it('should create overlay content with proper structure', () => {
    const mockSegments = [
      { text: 'Hello', at: 0 }
    ];
    
    fixture.componentRef.setInput('transcriptSegments', mockSegments);
    component.interactionMode.set('word');
    fixture.detectChanges();

    const clickEvent = {
      text: 'Hello',
      type: 'word' as const,
      index: 0,
      event: new MouseEvent('click', { clientX: 100, clientY: 100 })
    };

    component.handleSegmentClick(clickEvent);

    const content = component.overlayContent();
    expect(content.type).toBe('placeholder');
    expect(content.title).toContain('Word Information');
  });
});
