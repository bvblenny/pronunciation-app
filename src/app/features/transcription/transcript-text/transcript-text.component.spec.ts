import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { of, throwError } from 'rxjs';
import { TranscriptTextComponent } from './transcript-text.component';
import { DatamuseService } from '../../../core';

describe('TranscriptTextComponent', () => {
  let component: TranscriptTextComponent;
  let fixture: ComponentFixture<TranscriptTextComponent>;
  let datamuseServiceSpy: jasmine.SpyObj<DatamuseService>;

  beforeEach(async () => {
    datamuseServiceSpy = jasmine.createSpyObj('DatamuseService', ['getWordInfo']);

    await TestBed.configureTestingModule({
      imports: [TranscriptTextComponent, BrowserAnimationsModule, HttpClientTestingModule],
      providers: [{ provide: DatamuseService, useValue: datamuseServiceSpy }]
    }).compileComponents();

    fixture = TestBed.createComponent(TranscriptTextComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display empty state when no segments', () => {
    component.segments.set([]);
    component.interim.set('');
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.empty-state')).toBeTruthy();
  });

  it('should not display empty state when segments exist', () => {
    component.segments.set([{ text: 'Hello world', at: 0 }]);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.empty-state')).toBeNull();
  });

  it('should split text into words correctly', () => {
    component.segments.set([{ text: 'Hello world test', at: 0 }]);
    fixture.detectChanges();
    const paragraphs = component.paragraphs();
    expect(paragraphs[0].words.length).toBe(3);
    expect(paragraphs[0].words[0].text).toBe('Hello');
    expect(paragraphs[0].words[1].text).toBe('world');
    expect(paragraphs[0].words[2].text).toBe('test');
  });

  it('should handle interim text', () => {
    component.interim.set('interim text');
    fixture.detectChanges();
    const words = component.interimWords();
    expect(words.length).toBe(2);
    expect(words[0].text).toBe('interim');
    expect(words[1].text).toBe('text');
  });

  xit('should emit segmentSpeak when segment is clicked', () => {
    spyOn(component.segmentSpeak, 'emit');
    component.onSegmentClick({ text: 'hello', type: 'word', index: 0 });
    expect(component.segmentSpeak.emit).toHaveBeenCalledWith('hello');
  });

  it('should show overlay when segment is clicked', () => {
    datamuseServiceSpy.getWordInfo.and.returnValue(of([]));
    component.onSegmentClick({ text: 'hello', type: 'word', index: 0 });
    expect(component.showOverlay()).toBe(true);
  });

  it('should set selected segment when segment is clicked', () => {
    datamuseServiceSpy.getWordInfo.and.returnValue(of([]));
    const segment = { text: 'hello', type: 'word' as const, index: 0 };
    component.onSegmentClick(segment);
    expect(component.selectedSegment()).toEqual(segment);
  });

  it('should close overlay and clear selection', () => {
    component.showOverlay.set(true);
    component.selectedSegment.set({ text: 'test', type: 'word', index: 0 });
    component.onOverlayClosed();
    expect(component.showOverlay()).toBe(false);
    expect(component.selectedSegment()).toBeNull();
  });

  it('should create paragraphs from multiple segments', () => {
    component.segments.set([
      { text: 'First segment', at: 0 },
      { text: 'Second segment', at: 1000 }
    ]);
    fixture.detectChanges();
    const paragraphs = component.paragraphs();
    expect(paragraphs.length).toBe(2);
    expect(paragraphs[0].words.length).toBe(2);
    expect(paragraphs[1].words.length).toBe(2);
  });

  it('should populate overlay description from Datamuse on success', () => {
    const apiResponse = [{ word: 'hello', defs: ['n\ta greeting'] }];
    datamuseServiceSpy.getWordInfo.and.returnValue(of(apiResponse as any));

    const segment = { text: 'hello', type: 'word' as const, index: 0 };
    component.onSegmentClick(segment);

    expect(component.isOverlayLoading()).toBeFalse();
    const content = component.overlayContent();
    expect(content).toBeTruthy();
    expect(content!.description).toContain('Definition of "hello"');
  });

  it('should handle Datamuse error gracefully', () => {
    datamuseServiceSpy.getWordInfo.and.returnValue(throwError(() => new Error('Network error')));

    const segment = { text: 'hello', type: 'word' as const, index: 0 };
    component.onSegmentClick(segment);

    expect(component.isOverlayLoading()).toBeFalse();
    const content = component.overlayContent();
    expect(content).toBeTruthy();
    expect(content!.description).toContain('Could not load word details');
  });
});
