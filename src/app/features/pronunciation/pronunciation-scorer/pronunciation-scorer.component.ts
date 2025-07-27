import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatCardModule } from '@angular/material/card';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatIconModule } from '@angular/material/icon';
import {PronunciationEvaluationResult, PronunciationScore} from '../../../core/models/pronunciation.model';
import {PronunciationService} from '../../../core/services/pronunciation.service';

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
    MatIconModule
  ],
  templateUrl: './pronunciation-scorer.component.html',
  styleUrl: './pronunciation-scorer.component.scss'
})
export class PronunciationScorerComponent {
  referenceText = signal('');
  languageCode = signal('en-US');
  isRecording = signal(false);
  audioBlob = signal<Blob | null>(null);
  audioUrl = signal<string | null>(null);
  isLoading = signal(false);
  errorMessage = signal<string | null>(null);
  pronunciationScore = signal<PronunciationScore | null>(null);
  pronunciationEvaluation = signal<PronunciationEvaluationResult | null>(null);

  mediaRecorder: MediaRecorder | null = null;
  audioChunks: Blob[] = [];

  languageOptions = [
    { code: 'en-US', name: 'English (US)' },
    { code: 'en-GB', name: 'English (UK)' },
    { code: 'es-ES', name: 'Spanish' },
    { code: 'fr-FR', name: 'French' },
    { code: 'de-DE', name: 'German' }
  ];

  constructor(private pronunciationService: PronunciationService) {}

  async startRecording() {
    try {
      this.errorMessage.set(null);
      this.audioChunks = [];
      this.audioBlob.set(null);
      this.audioUrl.set(null);
      this.pronunciationScore.set(null);
      this.pronunciationEvaluation.set(null);

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.mediaRecorder = new MediaRecorder(stream);

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data);
        }
      };

      this.mediaRecorder.onstop = () => {
        const audioBlob = new Blob(this.audioChunks, { type: 'audio/wav' });
        this.audioBlob.set(audioBlob);
        this.audioUrl.set(URL.createObjectURL(audioBlob));

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
      this.audioBlob.set(file);
      this.audioUrl.set(URL.createObjectURL(file));
      this.pronunciationScore.set(null);
      this.pronunciationEvaluation.set(null);
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

    this.pronunciationService.scorePronunciationWithAlignment(
      this.audioBlob() as File,
      this.referenceText(),
    ).subscribe({
      next: (result) => {
        this.pronunciationEvaluation.set(result);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error scoring pronunciation:', error);
        this.errorMessage.set('Error scoring pronunciation. Please try again.');
        this.isLoading.set(false);
      }
    });
  }

  getOverallScore(): number {
    const evaluation = this.pronunciationEvaluation();
    if (!evaluation || !evaluation.words.length) return 0;

    const totalScore = evaluation.words.reduce((sum, word) => sum + word.evaluation, 0);
    return totalScore / evaluation.words.length;
  }

  getScoreColor(score: number): string {
    if (score >= 0.8) return 'green';
    if (score >= 0.6) return 'orange';
    return 'red';
  }

  resetForm() {
    this.referenceText.set('');
    this.audioBlob.set(null);
    this.audioUrl.set(null);
    this.pronunciationScore.set(null);
    this.pronunciationEvaluation.set(null);
    this.errorMessage.set(null);
  }
}
