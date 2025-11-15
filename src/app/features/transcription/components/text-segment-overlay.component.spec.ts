import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TextSegmentOverlayComponent, OverlayContent } from './text-segment-overlay.component';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

describe('TextSegmentOverlayComponent', () => {
  let component: TextSegmentOverlayComponent;
  let fixture: ComponentFixture<TextSegmentOverlayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TextSegmentOverlayComponent, MatIconModule, MatButtonModule]
    }).compileComponents();

    fixture = TestBed.createComponent(TextSegmentOverlayComponent);
    component = fixture.componentInstance;
    
    const mockContent: OverlayContent = {
      type: 'placeholder',
      title: 'Test Title',
      text: 'Test content'
    };
    
    fixture.componentRef.setInput('selectedText', 'test word');
    fixture.componentRef.setInput('content', mockContent);
    fixture.componentRef.setInput('position', { top: 100, left: 100 });
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display the overlay title', () => {
    const element = fixture.nativeElement as HTMLElement;
    const title = element.querySelector('.overlay-title');
    expect(title?.textContent).toContain('Test Title');
  });

  it('should display the selected text', () => {
    const element = fixture.nativeElement as HTMLElement;
    const selectedText = element.querySelector('.selected-text');
    expect(selectedText?.textContent).toContain('test word');
  });

  it('should display placeholder content', () => {
    const element = fixture.nativeElement as HTMLElement;
    const placeholderText = element.querySelector('.placeholder-text');
    expect(placeholderText?.textContent).toContain('Test content');
  });

  it('should emit onClose when backdrop is clicked', () => {
    let closeCalled = false;
    component.onClose.subscribe(() => {
      closeCalled = true;
    });

    const backdrop = fixture.nativeElement.querySelector('.overlay-backdrop') as HTMLElement;
    backdrop.click();

    expect(closeCalled).toBe(true);
  });

  it('should emit onClose when close button is clicked', () => {
    let closeCalled = false;
    component.onClose.subscribe(() => {
      closeCalled = true;
    });

    const closeButton = fixture.nativeElement.querySelector('.overlay-close') as HTMLElement;
    closeButton.click();

    expect(closeCalled).toBe(true);
  });

  it('should position overlay correctly', () => {
    const overlayContainer = fixture.nativeElement.querySelector('.overlay-container') as HTMLElement;
    expect(overlayContainer.style.top).toBe('100px');
    expect(overlayContainer.style.left).toBe('100px');
  });

  it('should display default title when none provided', () => {
    const mockContent: OverlayContent = {
      type: 'placeholder'
    };
    
    fixture.componentRef.setInput('content', mockContent);
    fixture.detectChanges();

    const element = fixture.nativeElement as HTMLElement;
    const title = element.querySelector('.overlay-title');
    expect(title?.textContent).toContain('Text Information');
  });
});
