import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

// One row from dbo.fn_get_all_questions()
export interface ApiQuestion {
  que_id: number;
  role: string;
  section_name: string;
  question: string;
  tier_level: string;
}

@Injectable({ providedIn: 'root' })
export class QuestionService {
  private http = inject(HttpClient);
  private base = environment.apiUrl;

  // All questions. Empty until loaded.
  readonly rows = signal<ApiQuestion[]>([]);
  private loading = false;

  // GET /api/questions. Runs only once, even if called many times.
  load(): void {
    if (this.loading || this.rows().length) return;
    this.loading = true;
    this.http.get<any>(`${this.base}/questions`).subscribe({
      next: (res) => {
        this.rows.set(res?.data ?? []);
        this.loading = false;
      },
      error: (e) => {
        console.error('Load questions failed', e);
        this.loading = false;
      },
    });
  }

  // POST /api/answered-que. Fire and forget, so the screen never waits.
  save(p: { ass_id: number; role: string; tier_level: string; que_id: number; ans: 'Yes' | 'No' }): void {
    this.http.post(`${this.base}/answered-que`, p).subscribe({
      error: (e) => console.error('Save answer failed', e),
    });
  }
}