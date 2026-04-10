import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { interval, startWith, switchMap, catchError, of, map } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

const HEALTH_POLL_INTERVAL_MS = 30_000;
const HEALTH_URL = '/api/health';

@Injectable({
  providedIn: 'root'
})
export class HealthService {
  private readonly http = inject(HttpClient);

  private readonly _backendAvailable = signal<boolean | null>(null);

  /** `true` = up, `false` = down, `null` = checking for the first time */
  readonly backendAvailable = this._backendAvailable.asReadonly();

  constructor() {
    interval(HEALTH_POLL_INTERVAL_MS)
      .pipe(
        startWith(0),
        switchMap(() =>
          this.http.get<{ status: string }>(HEALTH_URL).pipe(
            map(res => res?.status === 'ok'),
            catchError(() => of(false))
          )
        ),
        takeUntilDestroyed()
      )
      .subscribe(available => this._backendAvailable.set(available));
  }
}
