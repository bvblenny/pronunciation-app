import { Component, signal, OnDestroy, inject } from '@angular/core';
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
import { DetailedAnalysisDto, ProsodyScoreDto } from '../../../core/models/pronunciation.model';
import { PronunciationService } from '../../../core/services/pronunciation.service';
import { ProsodyPanelComponent } from '../../prosody/prosody-panel.component';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

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
    MatDividerModule,
    ProsodyPanelComponent
  ],
  templateUrl: './pronunciation-scorer.component.html',
  styleUrl: './pronunciation-scorer.component.scss'
})
export class PronunciationScorerComponent implements OnDestroy {
  private readonly pronunciationService = inject(PronunciationService);

  referenceText = signal('');
  languageCode = signal('en-US');
  isRecording = signal(false);
  audioBlob = signal<File | null>(null);
  audioUrl = signal<string | null>(null);
  isLoading = signal(false);
  errorMessage = signal<string | null>(null);
  detailedAnalysis = signal<DetailedAnalysisDto | null>(null);
  prosodyScore = signal<ProsodyScoreDto | null>(null);

  mediaRecorder: MediaRecorder | null = null;
  audioChunks: Blob[] = [];

  languageOptions = this.pronunciationService.getLanguagesSignal();

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
      this.prosodyScore.set(null);

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
      this.prosodyScore.set(null);
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

    const audio = this.audioBlob()!;
    const ref = this.referenceText();
    const lang = this.languageCode();

    const detailed$ = this.pronunciationService.analyzeDetailed(audio, ref, lang);
    const prosody$ = this.pronunciationService.evaluateProsody(audio, ref, lang)
      .pipe(catchError(err => {
        console.warn('Prosody evaluation failed', err);
        return of(null);
      }));

    forkJoin({ detailed: detailed$, prosody: prosody$ }).subscribe({
      next: ({ detailed, prosody }) => {
        this.detailedAnalysis.set(detailed);
        this.prosodyScore.set(prosody);
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
    // wer is always a number per model
    return this.clamp01(1 - analysisResult.wer);
  }

  getScoreColor(score: number): string {
    if (score >= 0.8) return 'var(--primary)';
    if (score >= 0.6) return '#f59e0b'; // amber-500
    return '#ef4444'; // red-500
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

  getScoreGradient(score: number): string {
    if (score >= 0.9) {
      return 'linear-gradient(135deg, #10b981 0%, #34d399 100%)'; // green gradient
    } else if (score >= 0.75) {
      return 'linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)'; // blue gradient
    } else if (score >= 0.6) {
      return 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)'; // amber gradient
    } else {
      return 'linear-gradient(135deg, #ef4444 0%, #f87171 100%)'; // red gradient
    }
  }

  getScoreRating(score: number): string {
    if (score >= 0.9) return 'Excellent! 🎉';
    if (score >= 0.75) return 'Great Job! 👏';
    if (score >= 0.6) return 'Good Effort 👍';
    if (score >= 0.4) return 'Keep Practicing 💪';
    return 'Needs Work 📚';
  }

  getScoreMessage(score: number): string {
    if (score >= 0.9) return 'Outstanding pronunciation! You\'ve mastered this text.';
    if (score >= 0.75) return 'Very good pronunciation with minor areas for improvement.';
    if (score >= 0.6) return 'Decent pronunciation, but there\'s room for improvement.';
    if (score >= 0.4) return 'Keep practicing! Focus on the highlighted words.';
    return 'Significant improvements needed. Practice slowly and carefully.';
  }

  getPhonemeBackground(evaluation: number): string {
    if (evaluation >= 0.8) {
      return 'linear-gradient(135deg, #10b981 0%, #34d399 100%)';
    } else if (evaluation >= 0.6) {
      return 'linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)';
    } else if (evaluation >= 0.4) {
      return 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)';
    } else {
      return 'linear-gradient(135deg, #ef4444 0%, #f87171 100%)';
    }
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
    this.prosodyScore.set(null);
    this.errorMessage.set(null);
  }
}
