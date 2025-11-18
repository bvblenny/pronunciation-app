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
    component.data = { text: 'test', type: 'word', index: 0 };
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display the segment text', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('test');
  });

  it('should emit segmentClick when clicked', () => {
    spyOn(component.segmentClick, 'emit');
    const element = fixture.nativeElement.querySelector('.text-segment') as HTMLElement;
    element.click();
    expect(component.segmentClick.emit).toHaveBeenCalledWith(component.data);
  });

  it('should emit segmentHover on mouse enter', () => {
    spyOn(component.segmentHover, 'emit');
    component.onMouseEnter();
    expect(component.segmentHover.emit).toHaveBeenCalledWith(component.data);
  });

  it('should set isHovered to true on mouse enter', () => {
    component.onMouseEnter();
    expect(component.isHovered).toBe(true);
  });

  it('should set isHovered to false on mouse leave', () => {
    component.isHovered = true;
    component.onMouseLeave();
    expect(component.isHovered).toBe(false);
  });

  it('should apply word class for word type', () => {
    component.data = { text: 'word', type: 'word', index: 0 };
    fixture.detectChanges();
    const element = fixture.nativeElement.querySelector('.text-segment');
    expect(element.classList.contains('text-segment--word')).toBe(true);
  });

  it('should apply sentence class for sentence type', () => {
    component.data = { text: 'sentence', type: 'sentence', index: 0 };
    fixture.detectChanges();
    const element = fixture.nativeElement.querySelector('.text-segment');
    expect(element.classList.contains('text-segment--sentence')).toBe(true);
  });
});
