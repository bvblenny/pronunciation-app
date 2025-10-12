import { Component, signal, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatCardModule } from '@angular/material/card';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { DetailedAnalysisDto } from '../../../core/models/pronunciation.model';
import { PronunciationService, DEFAULT_TRANSCRIPTION_LANGUAGES } from '../../../core/services/pronunciation.service';

@Component({
  selector: 'app-pronunciation-scorer',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatCardModule,
    MatProgressBarModule,
    MatIconModule,
    MatDividerModule
  ],
  templateUrl: './pronunciation-scorer.component.html',
  styleUrl: './pronunciation-scorer.component.scss'
})
export class PronunciationScorerComponent implements OnInit, OnDestroy {
  referenceText = signal('');
  languageCode = signal('en-US');
  isRecording = signal(false);
  audioBlob = signal<File | null>(null);
  audioUrl = signal<string | null>(null);
  isLoading = signal(false);
  errorMessage = signal<string | null>(null);
  detailedAnalysis = signal<DetailedAnalysisDto | null>(null);

  mediaRecorder: MediaRecorder | null = null;
  audioChunks: Blob[] = [];

  languageOptions: { code: string; name: string }[] = [];

  constructor(private pronunciationService: PronunciationService) {
  }

  ngOnInit(): void {
    this.pronunciationService.getTranscriptionLanguages().subscribe({
      next: langs => {
        this.languageOptions = (langs && langs.length) ? langs : [...DEFAULT_TRANSCRIPTION_LANGUAGES];
      },
      error: () => {
        this.languageOptions = [...DEFAULT_TRANSCRIPTION_LANGUAGES];
      }
    });
  }

  ngOnDestroy(): void {
    if (this.mediaRecorder) {
      try {
        this.mediaRecorder.stop();
      } catch {
      }
      const stream: MediaStream | undefined = (this.mediaRecorder as any).stream;
      stream?.getTracks().forEach(t => t.stop());
    }
    const url = this.audioUrl();
    if (url) {
      try {
        URL.revokeObjectURL(url);
      } catch {
      }
      this.audioUrl.set(null);
    }
  }

  async startRecording() {
    try {
      this.errorMessage.set(null);
      this.audioChunks = [];
      const prevUrl = this.audioUrl();
      if (prevUrl) {
        try {
          URL.revokeObjectURL(prevUrl);
        } catch {
        }
      }
      this.audioBlob.set(null);
      this.audioUrl.set(null);
      this.detailedAnalysis.set(null);

      const stream = await navigator.mediaDevices.getUserMedia({audio: true});
      this.mediaRecorder = new MediaRecorder(stream);

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data);
        }
      };

      this.mediaRecorder.onstop = () => {
        const blob = new Blob(this.audioChunks, {type: 'audio/wav'});
        const file = new File([blob], 'recording.wav', {type: blob.type || 'audio/wav'});
        this.audioBlob.set(file);
        const url = URL.createObjectURL(file);
        this.audioUrl.set(url);
        stream.getTracks().forEach(track => track.stop());
      };

      this.mediaRecorder.start();
      this.isRecording.set(true);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      this.errorMessage.set('Error accessing microphone. Please ensure you have granted microphone permissions.');
    }
  }

  stopRecording() {
    if (this.mediaRecorder && this.isRecording()) {
      this.mediaRecorder.stop();
      this.isRecording.set(false);
    }
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      const prevUrl = this.audioUrl();
      if (prevUrl) {
        try {
          URL.revokeObjectURL(prevUrl);
        } catch {
        }
      }
      this.audioBlob.set(file);
      this.audioUrl.set(URL.createObjectURL(file));
      this.detailedAnalysis.set(null);
    }
  }

  submitForScoring() {
    if (!this.audioBlob()) {
      this.errorMessage.set('Please record or upload audio first.');
      return;
    }
    if (!this.referenceText() || this.referenceText().trim() === '') {
      this.errorMessage.set('Please enter reference text.');
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.pronunciationService.analyzeDetailed(
      this.audioBlob()!,
      this.referenceText(),
      this.languageCode()
    ).subscribe({
      next: (result) => {
        this.detailedAnalysis.set(result);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error analyzing pronunciation:', error);
        this.errorMessage.set('Error analyzing pronunciation. Please try again.');
        this.isLoading.set(false);
      }
    });
  }

  getOverallScore(): number {
    const analysisResult = this.detailedAnalysis();

    if (!analysisResult) return 0;
    const evaluatedWords = analysisResult.words?.filter(word => typeof word.evaluation === 'number') || [];
    if (evaluatedWords.length) {
      const total = evaluatedWords.reduce((sum, w) => sum + (w.evaluation as number), 0);
      return this.clamp01(total / evaluatedWords.length);
    }
    if (typeof analysisResult.wer === 'number') {
      return this.clamp01(1 - analysisResult.wer);
    }
    return 0;
  }

  getScoreColor(score: number): string {
    if (score >= 0.8) return 'var(--primary)';
    if (score >= 0.6) return '#f59e0b'; // amber-500
    return '#ef4444'; // red-500
  }

  getRingStyle(score: number): string {
    const pct = Math.max(0, Math.min(1, score)) * 100;
    const color = this.getScoreColor(score);
    const track = 'rgba(2,6,23,0.08)';
    return `conic-gradient(${color} ${pct}%, ${track} ${pct}% 100%)`;
  }

  formatSec(sec?: number): string {
    if (sec == null || !isFinite(sec) || sec < 0) return '0:00';
    const total = Math.floor(sec);
    const m = Math.floor(total / 60);
    const s = total % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  }

  private clamp01(n: number): number {
    return Math.max(0, Math.min(1, n));
  }

  resetForm() {
    this.referenceText.set('');
    this.audioBlob.set(null);
    const prevUrl = this.audioUrl();
    if (prevUrl) {
      try {
        URL.revokeObjectURL(prevUrl);
      } catch {
      }
    }
    this.audioUrl.set(null);
    this.detailedAnalysis.set(null);
    this.errorMessage.set(null);
    this.errorMessage.set(null);
  }
}

