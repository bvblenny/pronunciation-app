import { Routes } from '@angular/router';
import {
  PronunciationScorerComponent
} from './features/pronunciation/pronunciation-scorer/pronunciation-scorer.component';

export const routes: Routes = [
  { path: '', component: PronunciationScorerComponent },
  { path: '**', redirectTo: '' }
];
