import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface DatamuseWordResult {
  word: string;
  defs?: string[];
}

@Injectable({ providedIn: 'root' })
export class DatamuseService {
  private readonly baseUrl = 'https://api.datamuse.com/words';

  constructor(private readonly http: HttpClient) {}

  getWordInfo(word: string): Observable<DatamuseWordResult[]> {
    const params = new HttpParams()
      .set('sp', word)
      .set('md', 'd')
      .set('max', '5');

    return this.http.get<DatamuseWordResult[]>(this.baseUrl, { params });
  }
}

