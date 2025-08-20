import { Routes } from '@angular/router';
import {
  PronunciationScorerComponent
} from './features/pronunciation/pronunciation-scorer/pronunciation-scorer.component';

export const routes: Routes = [
  { path: '', pathMatch: 'full', component: PronunciationScorerComponent },
  { path: 'transcribe', loadComponent: () => import('./features/transcription/live-transcriber.component').then(m => m.LiveTranscriberComponent) },
  { path: '**', redirectTo: '' }
];
