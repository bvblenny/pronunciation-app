import { Component, OnDestroy, signal, computed, effect, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { PronunciationService } from '../../../core';
import { SpeechRecognitionService } from '../../../core';
import { TranscriptionStore } from '../../../core';
import { TranscriptSegment } from '../../../core';
import { TranscriptTextComponent } from '../transcript-text/transcript-text.component';

@Component({
  selector: 'app-live-transcriber',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatProgressBarModule,
    MatTooltipModule,
    TranscriptTextComponent,
  ],
  templateUrl: './live-transcriber.component.html',
  styleUrl: './live-transcriber.component.scss'
})
export class LiveTranscriberComponent implements OnDestroy {
  private readonly pronunciationService = inject(PronunciationService);
  private readonly speechRecognitionService = inject(SpeechRecognitionService);
  private readonly transcriptionStore = inject(TranscriptionStore);

  languageCode = signal<string>('en-US');

  isSupported = this.speechRecognitionService.isSupported;
  isListening = this.speechRecognitionService.isListening;
  segments = this.speechRecognitionService.segments as () => TranscriptSegment[];
  interim = this.speechRecognitionService.interim;
  speechError = this.speechRecognitionService.error;

  isTranscribing = this.transcriptionStore.isTranscribing;
  fileError = this.transcriptionStore.error;

  errorMessage = computed(() => this.speechError() || this.fileError());
  languages = this.pronunciationService.getLanguagesSignal();

  fullTranscript = computed(() => {
    const text = this.segments().map((s: TranscriptSegment) => s.text).join(' ');
    const interimText = this.interim();
    return interimText ? text + ' ' + interimText : text;
  });

  constructor() {
    effect(() => {
      this.speechRecognitionService.setLanguage(this.languageCode());
    });
  }

  ngOnDestroy(): void {
    this.stop();
  }

  start() {
    this.speechRecognitionService.start(this.languageCode());
  }

  stop() {
    this.speechRecognitionService.stop();
  }

  clear() {
    this.speechRecognitionService.clear();
  }

  speak(text: string) {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = this.languageCode();
    window.speechSynthesis.speak(utterance);
  }

  copy() {
    navigator.clipboard?.writeText(this.fullTranscript());
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length) {
      const file = input.files[0];
      this.transcriptionStore.transcribeFile(
        file,
        this.languageCode(),
        (segments: TranscriptSegment[]) => {
          this.speechRecognitionService.setSegments(segments);
        }
      );
    }
  }
}
