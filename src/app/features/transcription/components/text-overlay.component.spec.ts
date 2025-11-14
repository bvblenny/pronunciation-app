import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { TextOverlayComponent } from './text-overlay.component';

describe('TextOverlayComponent', () => {
  let component: TextOverlayComponent;
  let fixture: ComponentFixture<TextOverlayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TextOverlayComponent, BrowserAnimationsModule]
    }).compileComponents();

    fixture = TestBed.createComponent(TextOverlayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should not display overlay when isVisible is false', () => {
    component.isVisible = false;
    fixture.detectChanges();
    const overlay = fixture.nativeElement.querySelector('.overlay-backdrop');
    expect(overlay).toBeNull();
  });

  it('should display overlay when isVisible is true', () => {
    component.isVisible = true;
    component.selectedSegment = { text: 'test', type: 'word', index: 0 };
    fixture.detectChanges();
    const overlay = fixture.nativeElement.querySelector('.overlay-backdrop');
    expect(overlay).toBeTruthy();
  });

  it('should emit closed event when close is called', () => {
    spyOn(component.closed, 'emit');
    component.close();
    expect(component.closed.emit).toHaveBeenCalled();
  });

  it('should set isVisible to false when close is called', () => {
    component.isVisible = true;
    component.close();
    expect(component.isVisible).toBe(false);
  });

  it('should close overlay when backdrop is clicked', () => {
    spyOn(component, 'close');
    component.onBackdropClick();
    expect(component.close).toHaveBeenCalled();
  });

  it('should display selected text', () => {
    component.isVisible = true;
    component.selectedSegment = { text: 'hello', type: 'word', index: 0 };
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('hello');
  });

  it('should display custom title when provided', () => {
    component.isVisible = true;
    component.content = { title: 'Custom Title' };
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Custom Title');
  });

  it('should display default title when not provided', () => {
    component.isVisible = true;
    component.selectedSegment = { text: 'test', type: 'word', index: 0 };
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Text Details');
  });
});
