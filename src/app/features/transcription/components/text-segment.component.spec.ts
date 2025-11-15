import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TextSegmentComponent } from './text-segment.component';

describe('TextSegmentComponent', () => {
  let component: TextSegmentComponent;
  let fixture: ComponentFixture<TextSegmentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TextSegmentComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(TextSegmentComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('text', 'test');
    fixture.componentRef.setInput('index', 0);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display text content', () => {
    const element = fixture.nativeElement as HTMLElement;
    expect(element.textContent).toContain('test');
  });

  it('should have word type by default', () => {
    expect(component.type()).toBe('word');
  });

  it('should emit click event on click', () => {
    let emittedEvent: any;
    component.onSegmentClick.subscribe((event) => {
      emittedEvent = event;
    });

    const span = fixture.nativeElement.querySelector('.text-segment') as HTMLElement;
    span.click();

    expect(emittedEvent).toBeDefined();
    expect(emittedEvent.text).toBe('test');
    expect(emittedEvent.type).toBe('word');
    expect(emittedEvent.index).toBe(0);
  });

  it('should apply correct CSS class for word type', () => {
    fixture.componentRef.setInput('type', 'word');
    fixture.detectChanges();

    const span = fixture.nativeElement.querySelector('.text-segment') as HTMLElement;
    expect(span.classList.contains('text-segment--word')).toBe(true);
  });

  it('should apply correct CSS class for sentence type', () => {
    fixture.componentRef.setInput('type', 'sentence');
    fixture.detectChanges();

    const span = fixture.nativeElement.querySelector('.text-segment') as HTMLElement;
    expect(span.classList.contains('text-segment--sentence')).toBe(true);
  });

  it('should apply highlighted class when isHighlighted is true', () => {
    fixture.componentRef.setInput('isHighlighted', true);
    fixture.detectChanges();

    const span = fixture.nativeElement.querySelector('.text-segment') as HTMLElement;
    expect(span.classList.contains('text-segment--highlighted')).toBe(true);
  });

  it('should have proper accessibility attributes', () => {
    const span = fixture.nativeElement.querySelector('.text-segment') as HTMLElement;
    expect(span.getAttribute('tabindex')).toBe('0');
    expect(span.getAttribute('role')).toBe('button');
    expect(span.getAttribute('aria-label')).toContain('test');
  });
});
